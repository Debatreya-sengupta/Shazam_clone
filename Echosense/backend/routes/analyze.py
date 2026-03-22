from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import Dict, Any
import tempfile
import os
from services.audio_analysis import analyze_audio
from services.embedding_model import get_audio_embedding
import librosa

router = APIRouter(prefix="/analyze", tags=["analyze"])

@router.post("/")
async def analyze_api(file: UploadFile = File(...)) -> Dict[str, Any]:
    try:
        content = await file.read()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm", mode="wb") as tmp:
            tmp.write(content)
            tmp_path = tmp.name
            
        try:
            y, sr = librosa.load(tmp_path, sr=22050)
            
            analysis = analyze_audio(y, sr)
            embedding = get_audio_embedding(y, sr)
            
            return {
                "analysis": analysis,
                "embedding_preview": embedding[:5]
            }
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
