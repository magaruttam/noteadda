from fastapi import APIRouter

from app.modules.auth.router import router as auth_router
from app.modules.categories.router import router as categories_router
from app.modules.notes.router import router as notes_router
from app.modules.users.router import router as users_router

api_router = APIRouter()

# Register module routers
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(categories_router, prefix="/categories", tags=["Categories"])
api_router.include_router(notes_router, prefix="/notes", tags=["Notes"])

