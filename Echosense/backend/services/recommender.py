import numpy as np
from typing import List, Dict, Any
from db.mongo import MongoDB
from bson.objectid import ObjectId
import json
import urllib.request
import urllib.parse
import asyncio

def fetch_itunes_link(song_title: str, artist_name: str) -> str | None:
    query = f"{song_title} {artist_name}"
    url = "https://itunes.apple.com/search?term=" + urllib.parse.quote_plus(query) + "&entity=song&limit=1"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as response:
            data = json.loads(response.read().decode())
            if data.get('resultCount', 0) > 0:
                return data['results'][0].get('trackViewUrl')
    except Exception as e:
        print(f"iTunes API Error: {e}")
    return None

async def get_recommendations(song_id: str, limit: int = 5) -> List[Dict[str, Any]]:
    db = MongoDB.get_db()
    songs_col = db["songs"]
    
    try:
        obj_id = ObjectId(song_id)
    except Exception:
        # Provide fallback if song_id is not a valid ObjectId (e.g. string IDs)
        obj_id = song_id
        
    target_song = await songs_col.find_one({"_id": obj_id})
    if not target_song or "embedding" not in target_song:
        return []
        
    target_emb = np.array(target_song["embedding"])
    target_lang = target_song.get("language")
    target_genre = target_song.get("genre")
    
    cursor = songs_col.find({"_id": {"$ne": obj_id}, "embedding": {"$exists": True}})
    
    similarities = []
    async for song in cursor:
        emb = np.array(song["embedding"])
        sim = float(np.dot(target_emb, emb))
        
        # Boost scores based on language (high emphasis) and genre
        if target_lang and song.get("language") == target_lang:
            sim += 0.3
            
        if target_genre and song.get("genre") == target_genre:
            sim += 0.1
            
        similarities.append({
            "song_id": str(song["_id"]),
            "title": song.get("title", "Unknown"),
            "artist": song.get("artist", "Unknown"),
            "similarity": round(sim, 4),
            "bpm": song.get("analysis", {}).get("bpm", 0),
            "mood": song.get("analysis", {}).get("mood", "unknown"),
            "energy": song.get("analysis", {}).get("energy", 0.0),
            "language": song.get("language"),
            "genre": song.get("genre")
        })
        
    similarities.sort(key=lambda x: x["similarity"], reverse=True)
    top_recs = similarities[:limit]
    
    # Fetch iTunes links
    for rec in top_recs:
        itunes_url = await asyncio.to_thread(fetch_itunes_link, rec["title"], rec["artist"])
        if itunes_url:
            rec["itunes_url"] = itunes_url
            
    return top_recs
