from collections.abc import Sequence
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.categories.models import Category
from app.modules.institutions.models import Course, Institution
from app.modules.notes.models import Note, NoteFile, NoteImage, NoteStatus


class NoteRepository:
    """Data access layer for Note entities."""

    async def get_by_id(self, db: AsyncSession, note_id: int) -> Note | None:
        stmt = (
            select(Note)
            .options(selectinload(Note.seller), selectinload(Note.files), selectinload(Note.images))
            .where(Note.id == note_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_slug(self, db: AsyncSession, slug: str) -> Note | None:
        stmt = select(Note).where(Note.slug == slug)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_notes(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 20,
        category_id: int | None = None,
        institution_id: int | None = None,
        course_id: int | None = None,
        seller_id: int | None = None,
        status: NoteStatus | None = None,
        search: str | None = None,
    ) -> Sequence[Note]:
        stmt = (
            select(Note)
            .options(selectinload(Note.seller), selectinload(Note.files), selectinload(Note.images))
            .order_by(Note.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        if category_id is not None:
            stmt = stmt.where(Note.category_id == category_id)
        if institution_id is not None:
            stmt = stmt.where(Note.institution_id == institution_id)
        if course_id is not None:
            stmt = stmt.where(Note.course_id == course_id)
        if seller_id is not None:
            stmt = stmt.where(Note.seller_id == seller_id)
        if status is not None:
            stmt = stmt.where(Note.status == status)
        if search:
            pattern = f"%{search}%"
            stmt = stmt.where(
                or_(Note.title.ilike(pattern), Note.summary.ilike(pattern))
            )

        result = await db.execute(stmt)
        return result.scalars().all()

    async def create(
        self,
        db: AsyncSession,
        *,
        note: Note,
        files: list[NoteFile] | None = None,
        images: list[NoteImage] | None = None,
    ) -> Note:
        if files:
            note.files = files
        if images:
            note.images = images

        db.add(note)
        await db.flush()
        await db.refresh(note, attribute_names=["seller", "files", "images"])
        return note

    async def update(self, db: AsyncSession, note: Note, updates: dict) -> Note:
        for field, value in updates.items():
            setattr(note, field, value)
        await db.flush()
        await db.refresh(note, attribute_names=["seller", "files", "images"])
        return note

    async def delete(self, db: AsyncSession, note: Note) -> None:
        await db.delete(note)
        await db.flush()

    async def category_exists(self, db: AsyncSession, category_id: int) -> bool:
        result = await db.execute(select(Category.id).where(Category.id == category_id))
        return result.scalar_one_or_none() is not None

    async def institution_exists(self, db: AsyncSession, institution_id: int) -> bool:
        result = await db.execute(select(Institution.id).where(Institution.id == institution_id))
        return result.scalar_one_or_none() is not None

    async def course_exists(self, db: AsyncSession, course_id: int) -> bool:
        result = await db.execute(select(Course.id).where(Course.id == course_id))
        return result.scalar_one_or_none() is not None


note_repository = NoteRepository()
