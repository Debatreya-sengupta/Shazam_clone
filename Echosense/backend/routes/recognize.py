from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import Dict, Any
import tempfile
import os
import base64
import urllib.request
import urllib.error
import urllib.parse
import json
import numpy as np

from services.audio_analysis import analyze_audio
import librosa

router = APIRouter(prefix="/recognize", tags=["recognize"])

RAPIDAPI_KEY = "cbd32e5cd4mshc404ab727ef2f7fp141d71jsn0bedca1873f6"
RAPIDAPI_HOST = "shazam.p.rapidapi.com"
RAPIDAPI_URL = "https://shazam.p.rapidapi.com/songs/v2/detect"

# Fallback API for Humming (SoundHound-style Melody Recognition)
AUDD_API_KEY = os.getenv("AUDD_API_KEY", "")
AUDD_URL = "https://api.audd.io/"

@router.post("/")
async def recognize_api(file: UploadFile = File(...)) -> Dict[str, Any]:
    try:
        content = await file.read()
        
        # Save to temp file securely
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm", mode="wb") as tmp:
            tmp.write(content)
            tmp_path = tmp.name
            
        try:
            # 1. Shazam RapidAPI expects raw 44100Hz audio. Let's load the snippet for it.
            # CRITICAL FIX: Add duration=4.0 so we don't load a 3 minute file into RAM and crash Render!
            y_rapid, sr_rapid = librosa.load(tmp_path, sr=44100, mono=True, duration=4.0)
            
            # Send max 4 seconds of audio to avoid 413 Payload Too Large and optimize speed
            max_samples = 44100 * 4
            if len(y_rapid) > max_samples:
                y_rapid = y_rapid[:max_samples]

            # Convert numpy float32 bounds to signed 16-bit PCM little-endian
            y_int16 = (y_rapid * 32767).astype(np.int16)
            raw_audio = y_int16.tobytes()
            b64_audio = base64.b64encode(raw_audio).decode('utf-8')
            
            # POST to RapidAPI
            req = urllib.request.Request(
                RAPIDAPI_URL, 
                data=b64_audio.encode('utf-8'), 
                headers={
                    "content-type": "text/plain",
                    "x-rapidapi-host": RAPIDAPI_HOST,
                    "x-rapidapi-key": RAPIDAPI_KEY
                }, 
                method="POST"
            )
            
            try:
                with urllib.request.urlopen(req) as response:
                    shazam_result = json.loads(response.read().decode())
            except urllib.error.HTTPError as e:
                err_msg = e.read().decode()
                print("RapidAPI HTTPError:", e.code, err_msg)
                raise HTTPException(status_code=e.code, detail=f"RapidAPI failed: {err_msg}")
            except Exception as e:
                print("RapidAPI Error:", str(e))
                raise HTTPException(status_code=500, detail="Failed to connect to RapidAPI Shazam Endpoint")

            track_title = "Unknown"
            track_artist = "Unknown"
            confidence_score = 0
            is_match = False

            if "track" in shazam_result:
                track = shazam_result["track"]
                track_title = track.get("title", "Unknown")
                track_artist = track.get("subtitle", "Unknown")
                confidence_score = 0.99
                is_match = True
            elif AUDD_API_KEY:
                # Fallback to AudD API for humming/singing recognition
                print("Shazam failed. Falling back to AudD for humming recognition...")
                import requests  # safe to import here as it's installed
                try:
                    with open(tmp_path, 'rb') as audio_file:
                        audd_res = requests.post(
                            AUDD_URL, 
                            data={'api_token': AUDD_API_KEY, 'return': 'apple_music,spotify'},
                            files={'file': audio_file}
                        )
                        audd_data = audd_res.json()
                        if audd_data.get('status') == 'success' and audd_data.get('result'):
                            track_title = audd_data['result'].get('title', 'Unknown')
                            track_artist = audd_data['result'].get('artist', 'Unknown')
                            confidence_score = 0.85 # Humming confidence proxy
                            is_match = True
                except Exception as e:
                    print("AudD Fallback Error:", str(e))

            if not is_match:
                return {"message": "No match found", "confidence": 0}
            
            # 2. Run our unique local Musical DNA analysis on a 10s snippet!
            # CRITICAL FIX: Limit duration so Render doesn't crash from OOM
            y, sr = librosa.load(tmp_path, sr=22050, duration=10.0)
            analysis = analyze_audio(y, sr)
            
            # Fetch recommendations from iTunes
            search_term = track_artist if is_match and track_artist != "Unknown" else analysis.get("mood", "pop")
            recommendations = []
            try:
                query = urllib.parse.quote(search_term)
                itunes_url = f"https://itunes.apple.com/search?term={query}&limit=5&entity=song"
                req_itunes = urllib.request.Request(itunes_url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req_itunes, timeout=5) as response:
                    itunes_data = json.loads(response.read().decode())
                    for item in itunes_data.get("results", []):
                        recommendations.append({
                            "title": item.get("trackName", "Unknown"),
                            "artist": item.get("artistName", "Unknown"),
                            "artwork": item.get("artworkUrl100", ""),
                            "mood": analysis.get("mood", "auto"),
                            "bpm": analysis.get("bpm", 120)
                        })
            except Exception as e:
                print("iTunes Recommendation Error:", e)

            return {
                "song": {
                    "title": track_title,
                    "artist": track_artist,
                    "confidence": confidence_score
                },
                "analysis": analysis,
                "timeline": [
                    {"time": 0, "label": "intro"},
                    {"time": 2.1, "label": "scan_point"}
                ],
                "recommendations": recommendations
            }
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
