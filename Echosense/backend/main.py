# Setup ffmpeg for librosa
import os, sys, shutil
try:
    import imageio_ffmpeg
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    ffmpeg_dir = os.path.dirname(ffmpeg_exe)
    ffmpeg_alias = os.path.join(ffmpeg_dir, "ffmpeg.exe")
    if not os.path.exists(ffmpeg_alias):
        shutil.copyfile(ffmpeg_exe, ffmpeg_alias)
    os.environ["PATH"] += os.pathsep + ffmpeg_dir
except ImportError:
    pass

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.mongo import MongoDB
from db.redis_cache import RedisCache
from routes import recognize, recommend, analyze

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing dependencies...")
    await MongoDB.connect()
    await RedisCache.connect()
    yield
    # Shutdown
    logger.info("Shutting down dependencies...")
    await MongoDB.close()
    await RedisCache.close()

app = FastAPI(
    title="Next-Gen Music Recognition API",
    description="A production-ready Shazam-like music recognition system with AI analysis.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recognize.router, prefix="/api/v1")
app.include_router(recommend.router, prefix="/api/v1")
app.include_router(analyze.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to the Next-Gen Music Recognition API"}
