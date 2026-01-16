from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import connect_db, disconnect_db
from app.routers import employees, attendance, dashboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    if not settings.database_url:
        print("⚠️ WARNING: DATABASE_URL is not set in environment variables.")
    
    try:
        await connect_db()
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        # We don't raise here to allow the app to start (e.g. for health checks)
        # but actual DB calls will fail.
        
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
