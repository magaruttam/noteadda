from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.modules.categories.schemas import CategoryResponse
from app.modules.categories.service import category_service

router = APIRouter()


@router.get("/", response_model=list[CategoryResponse])
async def list_categories(
    active_only: bool = Query(default=True),
    db: AsyncSession = Depends(get_db),
):
    """List all note categories."""
    return await category_service.list_categories(db, active_only=active_only)
