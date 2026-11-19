"""add profile_image_key to users

Revision ID: fb9c92b5413a
Revises: ee51800a599c
Create Date: 2026-11-19 13:14:40.016848

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fb9c92b5413a'
down_revision: Union[str, Sequence[str], None] = 'ee51800a599c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('profile_image_key', sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'profile_image_key')
