from collections.abc import Sequence
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.modules.users.models import User
from app.modules.users.repository import user_repository
from app.modules.users.schemas import UserCreate


class UserService:
    """Business logic / Controller service for users."""

    def __init__(self, repo=user_repository):
        self.repo = repo

    async def get_user_by_id(self, db: AsyncSession, user_id: int) -> User:
        user = await self.repo.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user

    async def list_users(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[User]:
        return await self.repo.get_all(db, skip=skip, limit=limit)

    async def register_user(self, db: AsyncSession, user_in: UserCreate) -> User:
        # Check email uniqueness
        if await self.repo.get_by_email(db, user_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists.",
            )

        # Check username uniqueness
        if await self.repo.get_by_username(db, user_in.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This username is already taken.",
            )

        # Hash password with Argon2
        hashed_password = hash_password(user_in.password)

        return await self.repo.create(
            db=db,
            email=user_in.email,
            username=user_in.username,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
        )


user_service = UserService()

