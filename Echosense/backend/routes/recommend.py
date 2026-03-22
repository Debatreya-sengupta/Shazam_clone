from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from services.recommender import get_recommendations

router = APIRouter(prefix="/recommend", tags=["recommend"])

@router.get("/{song_id}")
async def recommend_api(song_id: str) -> Dict[str, Any]:
    try:
        recommendations = await get_recommendations(song_id)
        if not recommendations:
            return {"message": "No recommendations found", "recommendations": []}
            
        return {
            "song_id": song_id,
            "recommendations": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
