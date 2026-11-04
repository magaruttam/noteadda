# NoteAdda Backend — Project Context & Architecture Guide

> **Note for Gemini Gem / AI Assistant:**
> This document provides the complete context, architectural patterns, conventions, and guidelines for the **NoteAdda Backend** project. Use this reference to maintain consistency in style, dependencies, architecture, and coding standards across all responses and generated code.

---

## 1. Project Overview

- **Project Name:** NoteAdda Backend
- **Domain:** A modern, high-performance backend API for the NoteAdda platform (note-taking, sharing, and content management).
- **Primary Language:** Python 3.14+
- **Package & Dependency Manager:** [uv](https://docs.astral.sh/uv/) (Astral)
- **Framework:** FastAPI
- **Database:** MySQL
- **ORM / Database Layer:** SQLAlchemy 2.0 (Asynchronous using `asyncmy` driver)
- **Migrations:** Alembic
- **Configuration & Validation:** Pydantic v2 & `pydantic-settings`

---

## 2. Technology Stack & Core Libraries

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime & Language** | Python `>=3.14` | Core runtime environment |
| **Package Management** | `uv` | Dependency resolution, virtual environments (`.venv`), lockfile (`uv.lock`) |
| **Web Framework** | `FastAPI` (with `standard` bundle) | High-performance async REST API framework |
| **ASGI Server** | `Uvicorn` | Serving FastAPI applications with hot-reloading |
| **Database** | MySQL | Relational database storage |
| **ORM** | `SQLAlchemy 2.0` | Typed asynchronous database interaction (`Mapped`, `mapped_column`) |
| **MySQL Driver** | `asyncmy` | Asynchronous MySQL driver compatible with asyncio and SQLAlchemy |
| **Schema Migrations** | `Alembic` | Version-controlled database schema migrations |
| **Data Validation** | `Pydantic v2` | Request validation, serialization, and response schemas |
| **App Settings** | `pydantic-settings` | Strongly-typed environment configuration management (`.env`) |
| **Authentication** | `python-jose` / `PyJWT`, `passlib` / `pwdlib` / `bcrypt` | JWT token generation, verification, and password hashing |

---

## 3. Directory & Folder Architecture

The project strictly follows the **`src` layout** with a modular, layered separation of concerns:

```text
noteadda-backend/
├── .venv/                         # Managed by uv (do not commit)
├── alembic/                       # Alembic migration scripts
│   ├── versions/                  # Individual timestamped migration revisions
│   └── env.py                     # Alembic async configuration connecting models to DB
├── alembic.ini                    # Alembic CLI configuration
├── src/
│   └── noteadda_backend/          # Main application package
│       ├── __init__.py
│       ├── main.py                # FastAPI app creation, middleware (CORS), router registration
│       │
│       ├── core/                  # Global foundations & core logic
│       │   ├── __init__.py
│       │   ├── config.py          # Settings class reading .env via pydantic-settings
│       │   ├── database.py        # Async engine, async_sessionmaker, get_db dependency
│       │   └── security.py        # Password hashing, JWT creation & verification
│       │
│       ├── models/                # SQLAlchemy ORM database models
│       │   ├── __init__.py        # Exposes all models for Alembic auto-discovery
│       │   ├── base.py            # DeclarativeBase, shared mixins (ID, timestamps)
│       │   ├── user.py            # User entity (auth, roles)
│       │   └── note.py            # Note entity (title, content, tags, ownership)
│       │
│       ├── schemas/               # Pydantic models (data transfer objects / DTOs)
│       │   ├── __init__.py
│       │   ├── user.py            # UserCreate, UserUpdate, UserResponse, Token
│       │   └── note.py            # NoteCreate, NoteUpdate, NoteResponse, NoteFilter
│       │
│       ├── crud/ (or services/)   # Repository & business logic layer
│       │   ├── __init__.py
│       │   ├── crud_user.py       # User DB queries & domain operations
│       │   └── crud_note.py       # Note DB queries & domain operations
│       │
│       └── api/                   # HTTP Route handlers (Controllers)
│           ├── __init__.py
│           ├── router.py          # Main API router merging v1 routes
│           └── v1/
│               ├── __init__.py
│               ├── auth.py        # Login, registration, token refresh
│               ├── users.py       # User profile & account management
│               └── notes.py       # Note CRUD endpoints
│
├── tests/                         # Automated test suite
│   ├── conftest.py                # Pytest fixtures (test DB session, async HTTP client)
│   ├── api/
│   └── crud/
│
├── .env.example                   # Sample environment configuration template
├── .gitignore                     # Git ignore rules
├── .python-version                # Python version specifier
├── pyproject.toml                 # Project metadata & dependencies
├── README.md                      # Quickstart documentation
└── uv.lock                        # Lockfile generated by uv
```

---

## 4. Key Architectural Patterns & Standards

### 4.1 Dependency Injection for Database Sessions
All route handlers interact with the database through FastAPI's dependency injection (`Depends(get_db)`):
```python
from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# core/database.py
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_sessionmaker_instance() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

### 4.2 SQLAlchemy 2.0 Typed Model Conventions
Models must use modern SQLAlchemy 2.0 type-annotated syntax (`Mapped` and `mapped_column`):
```python
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from noteadda_backend.models.base import Base

class Note(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
```

### 4.3 Separation of Pydantic Schemas vs ORM Models
- **ORM Models (`models/`)**: Solely define database table structure and relationships.
- **Pydantic Schemas (`schemas/`)**: Define input validation (`NoteCreate`), patch updates (`NoteUpdate`), and output responses (`NoteResponse`).
- Models returned by routes should specify `from_attributes = True` (formerly `orm_mode`) in `model_config` for seamless conversion.

### 4.4 Settings Management via `pydantic-settings`
All environment variables are loaded strongly-typed in `core/config.py`:
- MySQL Connection URL format:
  `mysql+asyncmy://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>`

---

## 5. Development Workflow Commands

All commands are executed using **uv**:

```bash
# Install / sync dependencies
uv sync

# Add a new package
uv add <package-name>

# Run local development server
uv run fastapi dev src/noteadda_backend/main.py

# Run database migrations with Alembic
uv run alembic revision --autogenerate -m "create users and notes tables"
uv run alembic upgrade head

# Run tests
uv run pytest
```

---

## 6. Instructions for Gemini Gem / AI Collaborators

When generating code or advising on this project:
1. **Always use modern typed Python (3.14+)** with type hints on all function signatures.
2. **Always write asynchronous code** (`async def`, `await session.execute(...)`) for I/O and route operations.
3. **Never place business or query logic directly inside route handlers**; delegate database operations to the `crud/` or `services/` layer.
4. **Never hardcode database credentials or secrets**; always read from `core.config.settings`.
5. **Respect the `src` layout**: imports must always be absolute, starting from `noteadda_backend...` (e.g., `from noteadda_backend.core.config import settings`).

