import enum
from sqlalchemy import Boolean, Enum, ForeignKey, Index, String, Text, UniqueConstraint, text
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin


class InstitutionType(str, enum.Enum):
    UNIVERSITY = "university"
    COLLEGE = "college"
    SCHOOL = "school"
    OTHER = "other"


class Institution(Base, TimestampMixin):
    """Academic institution (university, college, school) ORM entity."""

    __tablename__ = "institutions"

    id: Mapped[int] = mapped_column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(220), unique=True, nullable=False)
    institution_type: Mapped[InstitutionType] = mapped_column(
        Enum(
            InstitutionType,
            name="institution_type_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        default=InstitutionType.UNIVERSITY,
        server_default=text("'university'"),
        nullable=False,
    )
    country: Mapped[str] = mapped_column(
        String(100),
        default="Nepal",
        server_default=text("'Nepal'"),
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default=text("1"),
        nullable=False,
    )

    courses: Mapped[list["Course"]] = relationship(
        "Course",
        back_populates="institution",
    )


class Course(Base, TimestampMixin):
    """Academic course/program offered by an institution."""

    __tablename__ = "courses"
    __table_args__ = (
        UniqueConstraint("institution_id", "name", name="uq_course_institution_name"),
        Index("idx_courses_institution", "institution_id"),
    )

    id: Mapped[int] = mapped_column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    institution_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("institutions.id", name="fk_courses_institution", ondelete="RESTRICT"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default=text("1"),
        nullable=False,
    )

    institution: Mapped["Institution"] = relationship(
        "Institution",
        back_populates="courses",
    )
