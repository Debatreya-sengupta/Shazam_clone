import librosa
import numpy as np
from typing import Dict, Any

def analyze_audio(y, sr) -> Dict[str, Any]:
    # BPM (Tempo)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    if isinstance(tempo, np.ndarray):
        bpm = float(tempo[0])
    else:
        bpm = float(tempo)
    
    # Energy level (RMS energy)
    rms = librosa.feature.rms(y=y)
    energy = float(np.mean(rms))
    
    # Spectral features
    spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
    
    mean_centroid = float(np.mean(spectral_centroids))
    mean_rolloff = float(np.mean(spectral_rolloff))
    
    # Danceability proxy (beat strength / variance in energy)
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    danceability = float(np.var(onset_env) / (np.mean(onset_env) + 1e-6))
    
    # Mood mapping
    bpm_norm = min(max(bpm / 200.0, 0), 1.0)
    energy_norm = min(max(energy * 10, 0), 1.0)
    
    mood = "neutral"
    if bpm_norm > 0.6 and energy_norm > 0.5:
        mood = "energetic"
    elif bpm_norm < 0.4 and energy_norm < 0.3:
        mood = "sad"
    elif bpm_norm > 0.6 and energy_norm < 0.5:
        mood = "happy"
    elif bpm_norm < 0.4 and energy_norm > 0.5:
        mood = "dark"
    
    danceability_norm = min(max(danceability / 10.0, 0), 1.0)
    
    return {
        "bpm": int(round(bpm)),
        "energy": round(energy_norm, 3),
        "mood": mood,
        "danceability": round(danceability_norm, 3),
        "spectral_centroid": round(mean_centroid, 2),
        "spectral_rolloff": round(mean_rolloff, 2)
    }
