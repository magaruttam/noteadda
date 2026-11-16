import enum
from datetime import datetime
from decimal import Decimal
from sqlalchemy import (
    Boolean,
    CHAR,
    CheckConstraint,
    DECIMAL,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.dialects.mysql import BIGINT, INTEGER
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin


class NoteStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING = "pending"
    PUBLISHED = "published"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class Note(Base, TimestampMixin):
    """Main note ORM entity."""

    __tablename__ = "notes"
    __table_args__ = (
        CheckConstraint("pages > 0", name="chk_notes_pages"),
        CheckConstraint("rating >= 0 AND rating <= 5", name="chk_notes_rating"),
        CheckConstraint(
            "original_price IS NULL OR original_price >= price",
            name="chk_notes_original_price",
        ),
        Index("idx_notes_seller", "seller_id"),
        Index("idx_notes_category_status", "category_id", "status"),
        Index("idx_notes_course", "course_id"),
        Index("idx_notes_institution", "institution_id"),
        Index("idx_notes_status_created", "status", "created_at"),
    )

    id: Mapped[int] = mapped_column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    # Matches users.id (Integer)
    seller_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", name="fk_notes_seller", ondelete="RESTRICT"),
        nullable=False,
    )
    category_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("categories.id", name="fk_notes_category", ondelete="RESTRICT"),
        nullable=False,
    )
    institution_id: Mapped[int | None] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("institutions.id", name="fk_notes_institution", ondelete="SET NULL"),
        nullable=True,
    )
    course_id: Mapped[int | None] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("courses.id", name="fk_notes_course", ondelete="SET NULL"),
        nullable=True,
    )

    # Basic information
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(230), unique=True, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    semester: Mapped[str | None] = mapped_column(String(40), nullable=True)

    # Document information
    pages: Mapped[int] = mapped_column(INTEGER(unsigned=True), nullable=False)

    # Pricing (NPR)
    price: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        default=0,
        server_default=text("0"),
        nullable=False,
    )
    original_price: Mapped[int | None] = mapped_column(BIGINT(unsigned=True), nullable=True)
    currency: Mapped[str] = mapped_column(
        CHAR(3),
        default="NPR",
        server_default=text("'NPR'"),
        nullable=False,
    )

    # Statistics
    rating: Mapped[Decimal] = mapped_column(
        DECIMAL(3, 2),
        default=Decimal("0.00"),
        server_default=text("0.00"),
        nullable=False,
    )
    reviews_count: Mapped[int] = mapped_column(
        INTEGER(unsigned=True),
        default=0,
        server_default=text("0"),
        nullable=False,
    )
    downloads_count: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        default=0,
        server_default=text("0"),
        nullable=False,
    )
    views_count: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        default=0,
        server_default=text("0"),
        nullable=False,
    )

    # Publication status
    status: Mapped[NoteStatus] = mapped_column(
        Enum(
            NoteStatus,
            name="note_status_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        default=NoteStatus.DRAFT,
        server_default=text("'draft'"),
        nullable=False,
    )
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    files: Mapped[list["NoteFile"]] = relationship(
        "NoteFile",
        back_populates="note",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    images: Mapped[list["NoteImage"]] = relationship(
        "NoteImage",
        back_populates="note",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="NoteImage.sort_order",
    )


class NoteFile(Base):
    """Downloadable file associated with a note."""

    __tablename__ = "note_files"
    __table_args__ = (
        CheckConstraint("file_size > 0", name="chk_note_files_size"),
        Index("idx_note_files_note", "note_id"),
    )

    id: Mapped[int] = mapped_column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    note_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("notes.id", name="fk_note_files_note", ondelete="CASCADE"),
        nullable=False,
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_key: Mapped[str] = mapped_column(String(500), unique=True, nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_size: Mapped[int] = mapped_column(BIGINT(unsigned=True), nullable=False)
    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default=text("0"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    note: Mapped["Note"] = relationship("Note", back_populates="files")


class NoteImage(Base):
    """Cover and preview images for a note."""

    __tablename__ = "note_images"
    __table_args__ = (
        Index("idx_note_images_note", "note_id"),
    )

    id: Mapped[int] = mapped_column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    note_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("notes.id", name="fk_note_images_note", ondelete="CASCADE"),
        nullable=False,
    )
    image_key: Mapped[str] = mapped_column(String(500), unique=True, nullable=False)
    alt_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sort_order: Mapped[int] = mapped_column(
        Integer,
        default=0,
        server_default=text("0"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    note: Mapped["Note"] = relationship("Note", back_populates="images")
