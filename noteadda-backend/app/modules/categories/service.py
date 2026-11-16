from collections.abc import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.categories.models import Category


class CategoryService:
    """Business logic and data access for categories."""

    async def list_categories(
        self,
        db: AsyncSession,
        *,
        active_only: bool = True,
    ) -> Sequence[Category]:
        query = select(Category).order_by(Category.id.asc())
        if active_only:
            query = query.where(Category.is_active.is_(True))
        result = await db.execute(query)
        return result.scalars().all()


category_service = CategoryService()
