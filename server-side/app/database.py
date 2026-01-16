from prisma import Prisma
from contextlib import asynccontextmanager
from typing import AsyncGenerator

db = Prisma()

async def connect_db():
    """Connect to database"""
    if not db.is_connected():
        await db.connect()
    print("✅ Database connected successfully")

async def disconnect_db():
    """Disconnect from database"""
    if db.is_connected():
        await db.disconnect()
    print("❌ Database disconnected")

@asynccontextmanager
async def get_db() -> AsyncGenerator[Prisma, None]:
    """Database session dependency"""
    try:
        yield db
    finally:
        pass
