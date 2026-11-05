from datetime import timedelta
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.modules.auth.repository import auth_repository
from app.modules.auth.schemas import Token
from app.modules.users.models import User
from app.modules.users.schemas import UserCreate, UserResponse
from app.modules.users.service import user_service


class AuthService:
    """Business logic / Controller service for Authentication."""

    def __init__(self, repo=auth_repository, user_svc=user_service):
        self.repo = repo
        self.user_svc = user_svc

    async def register(self, db: AsyncSession, user_in: UserCreate) -> UserResponse:
        user = await self.user_svc.register_user(db, user_in)
        return UserResponse.model_validate(user)

    async def authenticate(self, db: AsyncSession, identifier: str, password: str) -> User:
        user = await self.repo.get_user_by_identifier(db, identifier)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username/email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username/email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user account",
            )
        return user

    async def issue_token_for_user(self, user: User) -> Token:
        access_token = create_access_token(
            subject=user.id,
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        return Token(access_token=access_token, token_type="bearer")


auth_service = AuthService()

