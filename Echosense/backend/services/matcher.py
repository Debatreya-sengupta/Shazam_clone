from collections import defaultdict
from typing import List, Tuple, Dict, Any
from db.mongo import MongoDB
import logging
from bson.objectid import ObjectId

logger = logging.getLogger(__name__)

async def match_hashes(hashes: List[Tuple[str, int]]) -> Dict[str, Any]:
    """
    hashes: list of (hash_str, query_offset)
    Returns: {"song_id": str, "confidence": float, "match_time": int}
    """
    if not hashes:
        return None
        
    db = MongoDB.get_db()
    hash_collection = db["fingerprints"]
    
    hash_values = [h[0] for h in hashes]
    cursor = hash_collection.find({"hash": {"$in": hash_values}})
    
    matches = defaultdict(lambda: defaultdict(int))
    total_matches = defaultdict(int)
    
    query_map = defaultdict(list)
    for h_val, q_off in hashes:
        query_map[h_val].append(q_off)
        
    async for db_hash in cursor:
        h_val = db_hash["hash"]
        song_id = str(db_hash["song_id"])
        db_offset = db_hash["offset"]
        
        for q_off in query_map[h_val]:
            offset_diff = db_offset - q_off
            matches[song_id][offset_diff] += 1
            total_matches[song_id] += 1
            
    if not matches:
        return None
        
    best_song_id = None
    best_offset_diff = 0
    max_count = 0
    
    for song_id, offsets in matches.items():
        for off, count in offsets.items():
            if count > max_count:
                max_count = count
                best_song_id = song_id
                best_offset_diff = off
                
    if not best_song_id:
        return None
        
    confidence = min(max_count / float(len(hashes)) * 5.0, 1.0)
    
    return {
        "song_id": best_song_id,
        "confidence": confidence,
        "offset_diff": best_offset_diff,
        "total_hashes_matched": max_count
    }
