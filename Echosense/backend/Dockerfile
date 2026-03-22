FROM python:3.11-slim

# Set up working directory
WORKDIR /app

# Install system dependencies (ffmpeg and libsndfile are essential for Librosa to process audio)
RUN apt-get update && \
    apt-get install -y ffmpeg libsndfile1 && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements and install python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the backend code
COPY . .

# Expose the Render default port automatically
EXPOSE 8000

# Start Uvicorn, mapping the dynamic PORT variable injected by Render
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
