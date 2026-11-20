from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.modules.users.models import User
from app.modules.users.schemas import PublicUserResponse, UserResponse
from app.modules.users.service import user_service

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    """Get the current authenticated user's profile."""
    return current_user


@router.put("/me/profile-image", response_model=UserResponse)
async def upload_my_profile_image(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload or replace the current user's profile image."""
    return await user_service.update_profile_image(db, current_user=current_user, file=file)


@router.delete("/me/profile-image", response_model=UserResponse)
async def delete_my_profile_image(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove the current user's profile image."""
    return await user_service.delete_profile_image(db, current_user=current_user)


@router.get("/", response_model=list[UserResponse])
async def get_users_list(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """List users (authenticated only)."""
    return await user_service.list_users(db, skip=skip, limit=limit)


@router.get("/{user_id}", response_model=PublicUserResponse)
async def get_public_user_profile(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a user's public profile by ID."""
    return await user_service.get_user_by_id(db, user_id)

