<div align="center">
  <h1>🎶 EchoSense</h1>
  <p><strong>Next-Gen Music Intelligence & Hybrid Recognition System</strong></p>
  <p>Beautiful, fast, and intelligent audio fingerprinting dashboard.</p>
</div>

<br />

## 🎵 Overview

EchoSense is a full-stack application that provides an immersive music recognition experience. It features a stunning, animated Next.js frontend combined with a highly robust Python/FastAPI backend.

The system uses a **Hybrid Recognition Engine**: it leverages local audio fingerprinting (using Librosa) and seamlessly orchestrates external APIs (Shazam API & AudD) for robust matching from studio recordings, humming, or raw audio analysis.

---

## ✨ Key Features

- **Hybrid Audio Matching:** Intelligently orchestrated fallbacks between local fingerprinting, Shazam API, and AudD to maximize matching accuracy.
- **Deep Audio Intelligence:** Extracts and analyzes track features including BPM, energy, danceability, spectral features, and mood mapping.
- **Vector-Based Recommender:** Suggests similar tracks using vector embeddings and Cosine Similarity.
- **Stunning UI/UX:** Built with Next.js 14 and Tailwind CSS, featuring rich micro-interactions and album art presentation via Framer Motion.
- **Production-Ready Backend:** Fully asynchronous FastAPI architecture, utilizing MongoDB for data persistence and Redis for lightning-fast caching.

---

## 🛠️ Tech Stack

**Frontend:**
- [Next.js 14](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

**Backend:**
- [Python 3.11+](https://www.python.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Librosa](https://librosa.org/) (Digital Signal Processing)
- [MongoDB](https://www.mongodb.com/) (Document Store)
- [Redis](https://redis.io/) (Caching)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- Node.js (v18+)
- Python (v3.11+)
- MongoDB (running on port 27017)
- Redis (running on port 6379)
- FFmpeg (required by Librosa for audio processing)

### 1. Clone the repository
```bash
git clone https://github.com/Debatreya-sengupta/Shazam_clone.git
cd Shazam_clone
```

### 2. Backend Setup
Navigate to the backend directory and install the required Python packages.

```bash
cd Echosense/backend

# Create and activate virtual environment (optional but recommended)
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --port 8000
```
*The backend Swagger UI will be available at `http://localhost:8000/docs`*

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and start the development server.

```bash
cd Echosense/frontend

# Install node dependencies
npm install

# Start the frontend app
npm run dev
```
*The frontend application will be available at `http://localhost:3000`*

---

## 💡 API Usage Examples

- **`POST /api/v1/recognize/`**
  Upload an audio file (`multipart/form-data`) to get a matched song along with intelligent UI metadata, mood, and audio DNA.
- **`GET /api/v1/recommend/{song_id}`**
  Fetch the top recommended similar songs using vector embeddings.
- **`POST /api/v1/analyze/`**
  Perform deep audio analysis directly on the audio buffer to return BPM, Danceability, Energy, and spectral data.

---

## 👨‍💻 Authors

Made by **Debatreya** and **Subhro**.
