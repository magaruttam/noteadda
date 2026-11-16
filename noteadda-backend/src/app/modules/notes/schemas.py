from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.modules.notes.models import NoteStatus


class NoteFileCreate(BaseModel):
    file_name: str = Field(min_length=1, max_length=255)
    file_key: str = Field(min_length=1, max_length=500)
    file_type: str = Field(min_length=1, max_length=50)
    file_size: int = Field(gt=0)
    is_primary: bool = False


class NoteFileResponse(NoteFileCreate):
    id: int
    note_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NoteImageCreate(BaseModel):
    image_key: str = Field(min_length=1, max_length=500)
    alt_text: str | None = Field(default=None, max_length=255)
    sort_order: int = 0


class NoteImageResponse(NoteImageCreate):
    id: int
    note_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NoteCreate(BaseModel):
    category_id: int = Field(gt=0)
    institution_id: int | None = Field(default=None, gt=0)
    course_id: int | None = Field(default=None, gt=0)

    title: str = Field(min_length=3, max_length=200)
    slug: str | None = Field(default=None, min_length=3, max_length=230)
    summary: str = Field(min_length=1)
    description: str | None = None
    semester: str | None = Field(default=None, max_length=40)

    pages: int = Field(gt=0)
    price: int = Field(default=0, ge=0)
    original_price: int | None = Field(default=None, ge=0)
    currency: str = Field(default="NPR", min_length=3, max_length=3)

    status: NoteStatus = NoteStatus.DRAFT
    files: list[NoteFileCreate] = Field(default_factory=list)
    images: list[NoteImageCreate] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_prices(self) -> "NoteCreate":
        if self.original_price is not None and self.original_price < self.price:
            raise ValueError("original_price must be greater than or equal to price")
        return self


class NoteUpdate(BaseModel):
    category_id: int | None = Field(default=None, gt=0)
    institution_id: int | None = Field(default=None, gt=0)
    course_id: int | None = Field(default=None, gt=0)

    title: str | None = Field(default=None, min_length=3, max_length=200)
    slug: str | None = Field(default=None, min_length=3, max_length=230)
    summary: str | None = Field(default=None, min_length=1)
    description: str | None = None
    semester: str | None = Field(default=None, max_length=40)

    pages: int | None = Field(default=None, gt=0)
    price: int | None = Field(default=None, ge=0)
    original_price: int | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)

    status: NoteStatus | None = None
    rejection_reason: str | None = None


class NoteResponse(BaseModel):
    id: int
    seller_id: int
    category_id: int
    institution_id: int | None
    course_id: int | None

    title: str
    slug: str
    summary: str
    description: str | None
    semester: str | None

    pages: int
    price: int
    original_price: int | None
    currency: str

    rating: Decimal
    reviews_count: int
    downloads_count: int
    views_count: int

    status: NoteStatus
    rejection_reason: str | None
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime

    files: list[NoteFileResponse] = Field(default_factory=list)
    images: list[NoteImageResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
