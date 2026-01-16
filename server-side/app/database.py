from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional

# Global variable to hold the Prisma instance
_db: Optional['Prisma'] = None

def get_prisma_client():
    global _db
    if _db is None:
        from prisma import Prisma
        _db = Prisma()
    return _db

async def connect_db():
    """Connect to database"""
    client = get_prisma_client()
    if not client.is_connected():
        await client.connect()
    print("✅ Database connected successfully")

async def disconnect_db():
    """Disconnect from database"""
    client = get_prisma_client()
    if client.is_connected():
        await client.disconnect()
    print("❌ Database disconnected")

@asynccontextmanager
async def get_db() -> AsyncGenerator['Prisma', None]:
    """Database session dependency"""
    try:
        yield get_prisma_client()
    finally:
        pass
