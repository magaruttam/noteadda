import asyncio
import mimetypes
import re
import uuid
from dataclasses import dataclass
from pathlib import Path
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings
from app.storage.client import get_r2_client

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

ALLOWED_DOCUMENT_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
}
MAX_DOCUMENT_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB


@dataclass(frozen=True)
class UploadedObject:
    key: str
    url: str
    file_name: str
    file_type: str
    file_size: int


def _sanitize_folder(folder: str) -> str:
    cleaned = folder.strip().strip("/")
    if not cleaned or ".." in cleaned or not re.fullmatch(r"[a-zA-Z0-9/_-]+", cleaned):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid storage folder path.",
        )
    return cleaned


def _build_object_key(folder: str, filename: str | None, content_type: str) -> str:
    safe_folder = _sanitize_folder(folder)
    ext = Path(filename).suffix.lower() if filename else ""
    if not ext:
        ext = mimetypes.guess_extension(content_type) or ""
    return f"{safe_folder}/{uuid.uuid4().hex}{ext}"


class StorageService:
    """Reusable async service for Cloudflare R2 validation, upload, download, and deletion."""

    async def upload_bytes(
        self,
        *,
        data: bytes,
        key: str,
        content_type: str,
    ) -> str:
        """Upload raw bytes to R2 and return the stored object key."""
        client = get_r2_client()
        await asyncio.to_thread(
            client.put_object,
            Bucket=settings.R2_BUCKET_NAME,
            Key=key,
            Body=data,
            ContentType=content_type,
        )
        return key

    async def upload_image(
        self,
        file: UploadFile,
        *,
        folder: str = "images",
    ) -> UploadedObject:
        """Validate and upload an image (JPEG, PNG, WEBP, GIF; max 5 MB) to R2."""
        content_type = file.content_type or ""
        if content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported image type '{content_type}'. Allowed: {', '.join(sorted(ALLOWED_IMAGE_TYPES))}",
            )

        data = await file.read()
        file_size = len(data)
        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded image is empty.",
            )
        if file_size > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Image exceeds the 5 MB limit.",
            )

        key = _build_object_key(folder, file.filename, content_type)
        await self.upload_bytes(data=data, key=key, content_type=content_type)

        return UploadedObject(
            key=key,
            url=self.get_public_url(key),
            file_name=file.filename or Path(key).name,
            file_type=content_type,
            file_size=file_size,
        )

    async def upload_file(
        self,
        file: UploadFile,
        *,
        folder: str = "files",
    ) -> UploadedObject:
        """Validate and upload a document (PDF, DOC, DOCX, PPT, PPTX; max 50 MB) to R2."""
        content_type = file.content_type or ""
        if content_type not in ALLOWED_DOCUMENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported document type. Allowed: PDF, DOC, DOCX, PPT, PPTX.",
            )

        data = await file.read()
        file_size = len(data)
        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )
        if file_size > MAX_DOCUMENT_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File exceeds the 50 MB limit.",
            )

        key = _build_object_key(folder, file.filename, content_type)
        await self.upload_bytes(data=data, key=key, content_type=content_type)

        return UploadedObject(
            key=key,
            url=self.get_public_url(key),
            file_name=file.filename or Path(key).name,
            file_type=content_type,
            file_size=file_size,
        )

    async def delete_object(self, key: str) -> None:
        """Delete an object from R2 by its key."""
        client = get_r2_client()
        await asyncio.to_thread(
            client.delete_object,
            Bucket=settings.R2_BUCKET_NAME,
            Key=key,
        )

    async def generate_presigned_url(
        self,
        key: str,
        *,
        expires_in: int = 3600,
    ) -> str:
        """Generate a temporary signed download URL for private objects."""
        client = get_r2_client()
        return await asyncio.to_thread(
            client.generate_presigned_url,
            "get_object",
            Params={"Bucket": settings.R2_BUCKET_NAME, "Key": key},
            ExpiresIn=expires_in,
        )

    def get_public_url(self, key: str) -> str:
        """Build a public URL if R2_PUBLIC_URL is configured, else return the key."""
        if not settings.R2_PUBLIC_URL:
            return key
        base = settings.R2_PUBLIC_URL.rstrip("/")
        clean_key = key.lstrip("/")
        return f"{base}/{clean_key}"


storage_service = StorageService()
