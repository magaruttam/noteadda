from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.modules.notes.models import NoteStatus
from app.modules.notes.schemas import (
    NoteCreate,
    NoteImageReorder,
    NoteImageResponse,
    NoteResponse,
    NoteReviewCreate,
    NoteReviewResponse,
    NoteUpdate,
)
from app.modules.notes.service import note_service
from app.modules.users.models import User

router = APIRouter()


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_in: NoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new note (authenticated user becomes the seller)."""
    return await note_service.create_note(db, note_in=note_in, current_user=current_user)


@router.get("/", response_model=list[NoteResponse])
async def list_notes(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    category_id: int | None = Query(default=None, gt=0),
    institution_id: int | None = Query(default=None, gt=0),
    course_id: int | None = Query(default=None, gt=0),
    seller_id: int | None = Query(default=None, gt=0),
    status_filter: NoteStatus | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None, min_length=1),
    db: AsyncSession = Depends(get_db),
):
    """List notes with optional filters and pagination."""
    return await note_service.list_notes(
        db,
        skip=skip,
        limit=limit,
        category_id=category_id,
        institution_id=institution_id,
        course_id=course_id,
        seller_id=seller_id,
        status_filter=status_filter,
        search=search,
    )


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a single note by ID including its files and images."""
    return await note_service.get_note(db, note_id=note_id)


@router.patch("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: int,
    note_in: NoteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing note (seller/owner only)."""
    return await note_service.update_note(
        db,
        note_id=note_id,
        note_in=note_in,
        current_user=current_user,
    )


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a note (seller/owner only)."""
    await note_service.delete_note(db, note_id=note_id, current_user=current_user)


@router.post(
    "/{note_id}/images",
    response_model=NoteImageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_note_image(
    note_id: int,
    file: UploadFile = File(...),
    alt_text: str | None = Form(default=None),
    sort_order: int | None = Form(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a cover or preview image for a note (seller/owner only)."""
    return await note_service.upload_note_image(
        db,
        note_id=note_id,
        file=file,
        alt_text=alt_text,
        sort_order=sort_order,
        current_user=current_user,
    )


@router.put("/{note_id}/images/reorder", response_model=list[NoteImageResponse])
async def reorder_note_images(
    note_id: int,
    reorder_in: NoteImageReorder,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reorder a note's images (seller/owner only)."""
    return await note_service.reorder_note_images(
        db,
        note_id=note_id,
        image_ids=reorder_in.image_ids,
        current_user=current_user,
    )


@router.delete("/{note_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note_image(
    note_id: int,
    image_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a note image from DB and R2 (seller/owner only)."""
    await note_service.delete_note_image(
        db,
        note_id=note_id,
        image_id=image_id,
        current_user=current_user,
    )


@router.get("/{note_id}/reviews", response_model=list[NoteReviewResponse])
async def list_note_reviews(
    note_id: int,
    db: AsyncSession = Depends(get_db),
):
    """List all ratings and reviews for a note."""
    return await note_service.list_reviews(db, note_id=note_id)


@router.post(
    "/{note_id}/reviews",
    response_model=NoteReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_or_update_note_review(
    note_id: int,
    review_in: NoteReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit or update a rating and review for a note (authenticated users)."""
    return await note_service.upsert_review(
        db,
        note_id=note_id,
        review_in=review_in,
        current_user=current_user,
    )
