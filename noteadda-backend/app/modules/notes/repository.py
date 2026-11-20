from collections.abc import Sequence
from decimal import Decimal
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.categories.models import Category
from app.modules.institutions.models import Course, Institution
from app.modules.notes.models import Note, NoteFile, NoteImage, NoteReview, NoteStatus


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
        await db.refresh(note)
        await db.refresh(note, attribute_names=["seller", "files", "images"])
        return note

    async def update(self, db: AsyncSession, note: Note, updates: dict) -> Note:
        for field, value in updates.items():
            setattr(note, field, value)
        await db.flush()
        await db.refresh(note)
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

    async def list_reviews(self, db: AsyncSession, note_id: int) -> Sequence[NoteReview]:
        stmt = (
            select(NoteReview)
            .options(selectinload(NoteReview.user))
            .where(NoteReview.note_id == note_id)
            .order_by(NoteReview.created_at.desc())
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_review_by_user(
        self, db: AsyncSession, note_id: int, user_id: int
    ) -> NoteReview | None:
        stmt = (
            select(NoteReview)
            .options(selectinload(NoteReview.user))
            .where(NoteReview.note_id == note_id, NoteReview.user_id == user_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def save_review_and_recalculate(
        self, db: AsyncSession, note: Note, review: NoteReview
    ) -> NoteReview:
        db.add(review)
        await db.flush()

        stats = await db.execute(
            select(func.avg(NoteReview.rating), func.count(NoteReview.id)).where(
                NoteReview.note_id == note.id
            )
        )
        avg_rating, count_reviews = stats.one()
        note.rating = Decimal(str(round(float(avg_rating or 0), 2)))
        note.reviews_count = int(count_reviews or 0)
        await db.flush()
        result = await db.execute(
            select(NoteReview)
            .options(selectinload(NoteReview.user))
            .where(NoteReview.id == review.id)
        )
        return result.scalar_one()

    async def get_next_image_sort_order(self, db: AsyncSession, note_id: int) -> int:
        result = await db.execute(
            select(func.max(NoteImage.sort_order)).where(NoteImage.note_id == note_id)
        )
        max_order = result.scalar_one_or_none()
        return 0 if max_order is None else int(max_order) + 1

    async def add_image(self, db: AsyncSession, image: NoteImage) -> NoteImage:
        db.add(image)
        await db.flush()
        await db.refresh(image)
        return image

    async def get_image_by_id(
        self, db: AsyncSession, note_id: int, image_id: int
    ) -> NoteImage | None:
        stmt = select(NoteImage).where(
            NoteImage.id == image_id,
            NoteImage.note_id == note_id,
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_images(self, db: AsyncSession, note_id: int) -> Sequence[NoteImage]:
        stmt = (
            select(NoteImage)
            .where(NoteImage.note_id == note_id)
            .order_by(NoteImage.sort_order.asc(), NoteImage.id.asc())
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def delete_image(self, db: AsyncSession, image: NoteImage) -> None:
        await db.delete(image)
        await db.flush()

    async def clear_primary_file(self, db: AsyncSession, note_id: int) -> None:
        stmt = select(NoteFile).where(NoteFile.note_id == note_id, NoteFile.is_primary.is_(True))
        result = await db.execute(stmt)
        for existing in result.scalars().all():
            existing.is_primary = False
        await db.flush()

    async def add_file(self, db: AsyncSession, note_file: NoteFile) -> NoteFile:
        db.add(note_file)
        await db.flush()
        await db.refresh(note_file)
        return note_file

    async def get_file_by_id(
        self, db: AsyncSession, note_id: int, file_id: int
    ) -> NoteFile | None:
        stmt = select(NoteFile).where(
            NoteFile.id == file_id,
            NoteFile.note_id == note_id,
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def delete_file(self, db: AsyncSession, note_file: NoteFile) -> None:
        await db.delete(note_file)
        await db.flush()


note_repository = NoteRepository()
