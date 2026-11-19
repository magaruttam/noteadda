from functools import lru_cache
import boto3
from botocore.config import Config
from fastapi import HTTPException, status

from app.core.config import settings


@lru_cache
def get_r2_client():
    """Return a cached boto3 S3 client configured for Cloudflare R2."""
    if (
        not settings.R2_ACCOUNT_ID
        or not settings.R2_ACCESS_KEY_ID
        or not settings.R2_SECRET_ACCESS_KEY
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cloudflare R2 storage credentials are not configured.",
        )

    return boto3.client(
        service_name="s3",
        endpoint_url=settings.r2_endpoint_url,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )
