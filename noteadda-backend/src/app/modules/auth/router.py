from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.modules.auth.schemas import LoginRequest, Token
from app.modules.auth.service import auth_service
from app.modules.users.models import User
from app.modules.users.schemas import UserCreate, UserResponse

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user account with Argon2 password hashing."""
    return await auth_service.register(db, user_in=user_in)


@router.post("/login", response_model=Token)
async def login_oauth2(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """OAuth2 compatible token login (works with Swagger Authorize button)."""
    user = await auth_service.authenticate(
        db,
        identifier=form_data.username,
        password=form_data.password,
    )
    return await auth_service.issue_token_for_user(user)


@router.post("/login/json", response_model=Token)
async def login_json(
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Standard JSON login for web / frontend clients."""
    user = await auth_service.authenticate(
        db,
        identifier=credentials.email_or_username,
        password=credentials.password,
    )
    return await auth_service.issue_token_for_user(user)


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    """Fetch profile of currently authenticated user."""
    return current_user

