from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, computed_field

from app.storage.service import storage_service


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    full_name: str | None = None


class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=128)


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    username: str | None = Field(default=None, min_length=3, max_length=50)
    full_name: str | None = None
    password: str | None = Field(default=None, min_length=6, max_length=128)


class UserResponse(UserBase):
    id: int
    is_active: bool
    profile_image_key: str | None = None
    created_at: datetime

    @computed_field
    @property
    def profile_image_url(self) -> str | None:
        if not self.profile_image_key:
            return None
        return storage_service.get_public_url(self.profile_image_key)

    model_config = ConfigDict(from_attributes=True)

