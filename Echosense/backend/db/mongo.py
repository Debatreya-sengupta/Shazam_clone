import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_NAME", "music_recognition")

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

    @classmethod
    async def connect(cls):
        try:
            cls.client = AsyncIOMotorClient(MONGO_URI)
            cls.db = cls.client[DB_NAME]
            logger.info(f"Connected to MongoDB at {MONGO_URI}")
        except Exception as e:
            logger.error(f"Could not connect to MongoDB: {e}")
            raise

    @classmethod
    async def close(cls):
        if cls.client:
            cls.client.close()
            logger.info("Closed MongoDB connection.")

    @classmethod
    def get_db(cls):
        return cls.db
