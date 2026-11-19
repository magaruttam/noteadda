import logging
from collections.abc import Sequence
from fastapi import HTTPException, UploadFile, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.modules.users.models import User
from app.modules.users.schemas import UserCreate
from app.storage.service import storage_service

logger = logging.getLogger(__name__)


class UserService:
    """Business logic and data access service for users."""

    async def get_by_id(self, db: AsyncSession, user_id: int) -> User | None:
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, db: AsyncSession, email: str) -> User | None:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_username(self, db: AsyncSession, username: str) -> User | None:
        result = await db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()

    async def get_by_email_or_username(self, db: AsyncSession, identifier: str) -> User | None:
        query = select(User).where(
            or_(User.email == identifier, User.username == identifier)
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def get_user_by_id(self, db: AsyncSession, user_id: int) -> User:
        user = await self.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user

    async def list_users(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[User]:
        result = await db.execute(select(User).offset(skip).limit(limit))
        return result.scalars().all()

    async def register_user(self, db: AsyncSession, user_in: UserCreate) -> User:
        # Check email uniqueness
        if await self.get_by_email(db, user_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists.",
            )

        # Check username uniqueness
        if await self.get_by_username(db, user_in.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This username is already taken.",
            )

        # Hash password with Argon2
        hashed_password = hash_password(user_in.password)

        user = User(
            email=user_in.email,
            username=user_in.username,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
            is_active=True,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user

    async def update_profile_image(
        self,
        db: AsyncSession,
        current_user: User,
        file: UploadFile,
    ) -> User:
        """Upload a new profile image to R2 and replace the user's existing one."""
        uploaded = await storage_service.upload_image(file, folder="avatars")
        old_key = current_user.profile_image_key

        current_user.profile_image_key = uploaded.key
        await db.flush()
        await db.refresh(current_user)

        if old_key and old_key != uploaded.key:
            try:
                await storage_service.delete_object(old_key)
            except Exception:
                logger.warning("Failed to delete old profile image '%s' from R2", old_key, exc_info=True)

        return current_user

    async def delete_profile_image(self, db: AsyncSession, current_user: User) -> User:
        """Remove the user's profile image from the database and R2."""
        old_key = current_user.profile_image_key
        if not old_key:
            return current_user

        current_user.profile_image_key = None
        await db.flush()
        await db.refresh(current_user)

        try:
            await storage_service.delete_object(old_key)
        except Exception:
            logger.warning("Failed to delete profile image '%s' from R2", old_key, exc_info=True)

        return current_user


user_service = UserService()
