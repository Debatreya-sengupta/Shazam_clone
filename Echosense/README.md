# Next-Gen Music Recognition System

A production-ready Shazam-like backend featuring comprehensive audio fingerprinting, vector-based recommendations, and deep audio analysis (BPM, Mood, Energy) to power Next-Gen UI experiences.

## Features
- **Audio Fingerprinting**: Librosa-based spectrogram peak extractions and hashing.
- **Matching Engine**: Offset clustering algorithm for high accuracy matching.
- **Audio Intelligence**: BPM, energy, spectral features, and mood mapping.
- **Recommender System**: Vector embeddings evaluated with Cosine Similarity.
- **Production-Ready**: FastAPI async loops, MongoDB for document storage, and Redis for caching.

## Minimal Setup Instructions

1. **Prerequisites**
   - Python 3.11+
   - MongoDB (running locally on port 27017 or set via `MONGO_URI`)
   - Redis (running locally on port 6379 or set via `REDIS_URL`)
   - ffmpeg (required by librosa for audio loading)

2. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Run the API**
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   Access the interactive Swagger UI at: `http://localhost:8000/docs`

4. **API Endpoints**
   - `POST /api/v1/recognize/`: Upload audio file (`multipart/form-data`) to get matched song along with intelligent UI metadata and timeline.
   - `GET /api/v1/recommend/{song_id}`: Fetch top recommended similar songs using embeddings.
   - `POST /api/v1/analyze/`: Perform deep audio analysis returning BPM, Danceability, Energy, Mood, and spectral features.

## Project Structure
```text
backend/
├── main.py
├── db/
│   ├── mongo.py
│   └── redis_cache.py
├── routes/
│   ├── recognize.py
│   ├── recommend.py
│   └── analyze.py
└── services/
    ├── fingerprint.py
    ├── matcher.py
    ├── recommender.py
    ├── audio_analysis.py
    └── embedding_model.py
```
