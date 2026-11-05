from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.router import api_router
from app.core.config import settings
from app.database.base import Base
from app.database.session import engine, get_db
# Import models to ensure they are registered with Base.metadata
from app.modules.users.models import User


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Lifecycle startup
    yield
    # Cleanup database connection pool on shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan,
)

# Register main API router (/api/v1/...)
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def read_root():
    return {
        "message": "Welcome to NoteAdda API!",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
    }

