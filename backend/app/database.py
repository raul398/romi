from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings

client: AsyncIOMotorClient | None = None


async def connect_db():
    global client
    client = AsyncIOMotorClient(settings.mongo_uri)


async def close_db():
    global client
    if client:
        client.close()
        client = None


def get_db():
    return client["romi"] if client else None
