import os
import logging
import redis.asyncio as redis

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

class RedisCache:
    client = None

    @classmethod
    async def connect(cls):
        try:
            cls.client = redis.from_url(REDIS_URL, decode_responses=False)
            logger.info(f"Connected to Redis at {REDIS_URL}")
        except Exception as e:
            logger.error(f"Could not connect to Redis: {e}")
            raise

    @classmethod
    async def close(cls):
        if cls.client:
            await cls.client.close()
            logger.info("Closed Redis connection.")
            
    @classmethod
    def get_client(cls):
        return cls.client
