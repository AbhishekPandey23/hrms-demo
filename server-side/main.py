from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import connect_db, disconnect_db
from app.routers import employees, attendance, dashboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup process
    print("🚀 Starting up...")
    
    # 1. Check if Prisma is generated
    try:
        from prisma import Prisma
        print("✅ Prisma client found")
    except (ImportError, RuntimeError) as e:
        print(f"⚠️ Prisma client issue: {e}. Attempting to generate...")
        import subprocess
        import sys
        subprocess.run([sys.executable, "-m", "prisma", "generate"])
        # Fetching binaries just in case
        subprocess.run([sys.executable, "-m", "prisma", "py", "fetch"])
    
    # 2. Check Database URL
    if not settings.database_url:
        print("⚠️ WARNING: DATABASE_URL is not set in environment variables.")
    
    # 3. Connect to DB
    try:
        await connect_db()
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        
    yield
    # Shutdown
    await disconnect_db()

app = FastAPI(
    title="HRMS Lite API",
    description="Human Resource Management System API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(employees.router)
app.include_router(attendance.router)
app.include_router(dashboard.router)

@app.get("/")
async def root():
    return {
        "message": "HRMS Lite API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
