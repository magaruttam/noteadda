import logging
import re
import uuid
from collections.abc import Sequence
from datetime import datetime, timezone
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.notes.models import Note, NoteFile, NoteImage, NoteReview, NoteStatus
from app.modules.notes.repository import note_repository
from app.modules.notes.schemas import NoteCreate, NoteReviewCreate, NoteUpdate
from app.modules.users.models import User
from app.storage.service import storage_service

logger = logging.getLogger(__name__)


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "note"


class NoteService:
    """Business logic / controller service for notes."""

    def __init__(self, repo=note_repository):
        self.repo = repo

    async def _ensure_unique_slug(
        self,
        db: AsyncSession,
        raw_slug: str,
        *,
        exclude_note_id: int | None = None,
    ) -> str:
        base_slug = _slugify(raw_slug)[:215]
        existing = await self.repo.get_by_slug(db, base_slug)
        if not existing or existing.id == exclude_note_id:
            return base_slug
        return f"{base_slug}-{uuid.uuid4().hex[:8]}"

    async def _validate_relations(
        self,
        db: AsyncSession,
        *,
        category_id: int | None = None,
        institution_id: int | None = None,
        course_id: int | None = None,
    ) -> None:
        if category_id is not None and not await self.repo.category_exists(db, category_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )
        if institution_id is not None and not await self.repo.institution_exists(db, institution_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institution not found",
            )
        if course_id is not None and not await self.repo.course_exists(db, course_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )

    async def create_note(
        self,
        db: AsyncSession,
        *,
        note_in: NoteCreate,
        current_user: User,
    ) -> Note:
        await self._validate_relations(
            db,
            category_id=note_in.category_id,
            institution_id=note_in.institution_id,
            course_id=note_in.course_id,
        )

        if note_in.slug:
            normalized_slug = _slugify(note_in.slug)
            if await self.repo.get_by_slug(db, normalized_slug):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A note with this slug already exists.",
                )
            slug = normalized_slug
        else:
            slug = await self._ensure_unique_slug(db, note_in.title)

        published_at = (
            datetime.now(timezone.utc) if note_in.status == NoteStatus.PUBLISHED else None
        )

        note = Note(
            seller_id=current_user.id,
            category_id=note_in.category_id,
            institution_id=note_in.institution_id,
            course_id=note_in.course_id,
            title=note_in.title,
            slug=slug,
            summary=note_in.summary,
            description=note_in.description,
            semester=note_in.semester,
            pages=note_in.pages,
            price=note_in.price,
            original_price=note_in.original_price,
            currency=note_in.currency.upper(),
            status=note_in.status,
            published_at=published_at,
        )

        files = [NoteFile(**file_in.model_dump()) for file_in in note_in.files]
        images = [NoteImage(**img_in.model_dump()) for img_in in note_in.images]

        return await self.repo.create(db, note=note, files=files, images=images)

    async def get_note(self, db: AsyncSession, note_id: int) -> Note:
        note = await self.repo.get_by_id(db, note_id)
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found",
            )
        return note

    async def _get_owned_note(
        self, db: AsyncSession, note_id: int, current_user: User, action: str = "modify"
    ) -> Note:
        note = await self.get_note(db, note_id)
        if note.seller_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You do not have permission to {action} this note.",
            )
        return note

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
        status_filter: NoteStatus | None = None,
        search: str | None = None,
    ) -> Sequence[Note]:
        return await self.repo.list_notes(
            db,
            skip=skip,
            limit=limit,
            category_id=category_id,
            institution_id=institution_id,
            course_id=course_id,
            seller_id=seller_id,
            status=status_filter,
            search=search,
        )

    async def update_note(
        self,
        db: AsyncSession,
        *,
        note_id: int,
        note_in: NoteUpdate,
        current_user: User,
    ) -> Note:
        note = await self._get_owned_note(db, note_id, current_user, action="update")

        updates = note_in.model_dump(exclude_unset=True)
        if not updates:
            return note

        await self._validate_relations(
            db,
            category_id=updates.get("category_id"),
            institution_id=updates.get("institution_id"),
            course_id=updates.get("course_id"),
        )

        if "slug" in updates and updates["slug"] is not None:
            normalized_slug = _slugify(updates["slug"])
            existing = await self.repo.get_by_slug(db, normalized_slug)
            if existing and existing.id != note.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A note with this slug already exists.",
                )
            updates["slug"] = normalized_slug

        new_price = updates.get("price", note.price)
        new_original_price = (
            updates["original_price"]
            if "original_price" in updates
            else note.original_price
        )
        if new_original_price is not None and new_original_price < new_price:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="original_price must be greater than or equal to price",
            )

        if "currency" in updates and updates["currency"] is not None:
            updates["currency"] = updates["currency"].upper()

        if (
            updates.get("status") == NoteStatus.PUBLISHED
            and note.published_at is None
        ):
            updates["published_at"] = datetime.now(timezone.utc)

        return await self.repo.update(db, note, updates)

    async def delete_note(
        self,
        db: AsyncSession,
        *,
        note_id: int,
        current_user: User,
    ) -> None:
        note = await self._get_owned_note(db, note_id, current_user, action="delete")
        image_keys = [img.image_key for img in note.images]
        await self.repo.delete(db, note)
        for key in image_keys:
            try:
                await storage_service.delete_object(key)
            except Exception:
                logger.warning("Failed to delete note image '%s' from R2", key, exc_info=True)

    async def upload_note_image(
        self,
        db: AsyncSession,
        *,
        note_id: int,
        file: UploadFile,
        alt_text: str | None = None,
        sort_order: int | None = None,
        current_user: User,
    ) -> NoteImage:
        """Upload a cover/preview image for a note to R2 and save its metadata."""
        await self._get_owned_note(db, note_id, current_user, action="update")
        uploaded = await storage_service.upload_image(file, folder=f"notes/{note_id}/images")

        resolved_order = (
            sort_order
            if sort_order is not None
            else await self.repo.get_next_image_sort_order(db, note_id)
        )
        image = NoteImage(
            note_id=note_id,
            image_key=uploaded.key,
            alt_text=alt_text.strip() if alt_text else None,
            sort_order=resolved_order,
        )
        try:
            return await self.repo.add_image(db, image)
        except Exception:
            try:
                await storage_service.delete_object(uploaded.key)
            except Exception:
                logger.warning("Failed to clean up R2 object '%s' after DB error", uploaded.key, exc_info=True)
            raise

    async def reorder_note_images(
        self,
        db: AsyncSession,
        *,
        note_id: int,
        image_ids: list[int],
        current_user: User,
    ) -> Sequence[NoteImage]:
        """Reorder a note's images by updating sort_order according to image_ids."""
        await self._get_owned_note(db, note_id, current_user, action="update")
        existing_images = await self.repo.list_images(db, note_id)
        existing_by_id = {img.id: img for img in existing_images}

        if len(image_ids) != len(set(image_ids)) or set(image_ids) != set(existing_by_id.keys()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="image_ids must include every image belonging to this note exactly once.",
            )

        for idx, image_id in enumerate(image_ids):
            existing_by_id[image_id].sort_order = idx

        await db.flush()
        return await self.repo.list_images(db, note_id)

    async def delete_note_image(
        self,
        db: AsyncSession,
        *,
        note_id: int,
        image_id: int,
        current_user: User,
    ) -> None:
        """Delete a single image from a note and remove it from R2."""
        await self._get_owned_note(db, note_id, current_user, action="update")
        image = await self.repo.get_image_by_id(db, note_id, image_id)
        if not image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note image not found",
            )

        key = image.image_key
        await self.repo.delete_image(db, image)
        try:
            await storage_service.delete_object(key)
        except Exception:
            logger.warning("Failed to delete note image '%s' from R2", key, exc_info=True)

    async def list_reviews(self, db: AsyncSession, note_id: int) -> Sequence[NoteReview]:
        await self.get_note(db, note_id)
        return await self.repo.list_reviews(db, note_id)

    async def upsert_review(
        self,
        db: AsyncSession,
        *,
        note_id: int,
        review_in: NoteReviewCreate,
        current_user: User,
    ) -> NoteReview:
        note = await self.get_note(db, note_id)
        existing = await self.repo.get_review_by_user(db, note_id, current_user.id)
        if existing:
            existing.rating = review_in.rating
            existing.comment = review_in.comment.strip() if review_in.comment else None
            review = existing
        else:
            review = NoteReview(
                note_id=note.id,
                user_id=current_user.id,
                rating=review_in.rating,
                comment=review_in.comment.strip() if review_in.comment else None,
            )
        return await self.repo.save_review_and_recalculate(db, note, review)


note_service = NoteService()
