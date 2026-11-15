from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base directory pointing to noteadda-backend root
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    APP_NAME: str = "NoteAdda Backend"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:4200",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:4200",
        "http://127.0.0.1:5173",
    ]

    # Security & JWT
    SECRET_KEY: str = "supersecretjwtkey_change_in_production_noteadda_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database Credentials
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = "root"
    DB_NAME: str = "noteadda"

    DATABASE_URL: str = "mysql+asyncmy://root:root@localhost:3306/noteadda"

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

