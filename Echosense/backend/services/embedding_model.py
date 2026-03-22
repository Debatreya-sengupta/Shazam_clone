import librosa
import numpy as np
from typing import List

def get_audio_embedding(y, sr) -> List[float]:
    """
    Generate a 128-dimensional embedding from audio.
    Uses MFCC feature statistics (mean and std) as a lightweight representative vector.
    """
    # 64 MFCCs * 2 (mean, std) = 128 embedding dimensions
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=64)
    
    mfccs_mean = np.mean(mfccs, axis=1)
    mfccs_std = np.std(mfccs, axis=1)
    
    embedding = np.concatenate((mfccs_mean, mfccs_std))
    
    # Normalize vector to unit length for cosine similarity (FAISS compatibility)
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm
        
    return embedding.tolist()
