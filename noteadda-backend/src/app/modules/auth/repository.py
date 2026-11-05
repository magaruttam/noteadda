from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.users.models import User
from app.modules.users.repository import user_repository


class AuthRepository:
    """Data Access Layer for Auth module."""

    async def get_user_by_identifier(self, db: AsyncSession, identifier: str) -> User | None:
        return await user_repository.get_by_email_or_username(db, identifier)


auth_repository = AuthRepository()

