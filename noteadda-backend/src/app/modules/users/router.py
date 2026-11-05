from collections.abc import Sequence
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.modules.users.models import User
from app.modules.users.schemas import UserResponse
from app.modules.users.service import user_service

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    """Get the current authenticated user's profile."""
    return current_user


@router.get("/", response_model=list[UserResponse])
async def get_users_list(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """List users (authenticated only)."""
    return await user_service.list_users(db, skip=skip, limit=limit)

