# NoteAdda

**NoteAdda** is a full-stack study notes marketplace built for students and educators across Nepal. Sellers can publish semester notes, solved past papers, and study guides (priced in NPR), while students can browse by category, search, view note details, and submit ratings & reviews.

---

## Tech Stack

### Backend (`noteadda-backend/`)
- **Framework:** FastAPI (async REST API)
- **Language & Package Manager:** Python 3.14+, [`uv`](https://docs.astral.sh/uv/)
- **Database & ORM:** MySQL + SQLAlchemy 2.0 (`asyncmy`)
- **Migrations:** Alembic
- **Validation & Config:** Pydantic v2 & `pydantic-settings`
- **Auth & Security:** JWT (`PyJWT`) + Argon2id password hashing (`pwdlib`)

### Frontend (`frontend/`)
- **Framework:** Angular 22 (standalone components, signals, zoneless change detection)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`) with Light & Dark theme support
- **Testing:** Vitest

---

## Project Structure

```text
noteadda/
├── noteadda-backend/          # FastAPI backend
│   ├── alembic/               # Database migrations
│   ├── app/
│   │   ├── main.py            # Entry point
│   │   ├── api/               # API v1 router aggregator
│   │   ├── core/              # Config, JWT security, dependencies
│   │   ├── database/          # Base models & async session
│   │   └── modules/           # Feature modules (auth, users, categories, institutions, notes)
│   ├── .env.example
│   └── pyproject.toml
│
└── frontend/                  # Angular 22 + Tailwind CSS v4 frontend
    ├── proxy.conf.json        # Proxies /api -> http://127.0.0.1:8000
    └── src/app/
        ├── core/              # AuthService, NotesService, ThemeService, authInterceptor
        ├── features/
        │   ├── marketplace/   # Home, Notes Catalog (/notes), Note Detail (/notes/:id)
        │   ├── seller/        # Seller Studio (/seller), How to Sell Guide (/how-to-sell)
        │   ├── account/       # My Account & Appearance settings (/account)
        │   └── auth/          # Login (/login), Register (/register)
        └── shared/            # SiteHeader, SiteFooter
```

---

## Key Features

- **Authentication & User Profiles:** Register, JSON/OAuth2 login, JWT Bearer authentication, and `/users/me` profile resolution.
- **Nepal-Wide Categories:** Dynamic categories served from `/api/v1/categories/` with scrollable category filter pills.
- **Marketplace & Catalog:** Search by title/summary, filter by category, institute, course, and sort by popularity, rating, or price.
- **Note Detail Page (`/notes/:id`):** 3D book cover preview, seller username, specifications, attached PDFs, and purchase card.
- **Ratings & Reviews:** Authenticated 1–5 star ratings (with optional comments) stored in `note_reviews`, automatically updating average note ratings and Seller Studio analytics.
- **Seller Studio (`/seller`):** Create, edit, publish/unpublish, and delete notes with a live store preview and per-note analytics modal.
- **How to Sell Guide (`/how-to-sell`):** Step-by-step onboarding guide for sellers.
- **Light & Dark Theme:** Instant toggle in the header and My Account page, persisted in `localStorage`.

---

## Getting Started

### 1. Backend Setup (`noteadda-backend/`)

```bash
cd noteadda-backend

# Install dependencies
uv sync

# Configure environment variables
cp .env.example .env
# Update DATABASE_URL, DB_NAME=noteadda, and SECRET_KEY in .env

# Run database migrations
uv run alembic upgrade head

# Start the FastAPI server (http://127.0.0.1:8000)
uv run fastapi dev app/main.py
```

- **Interactive API Docs (Swagger UI):** `http://127.0.0.1:8000/docs`

### 2. Frontend Setup (`frontend/`)

```bash
cd frontend

# Install dependencies
npm install

# Start the Angular dev server with API proxy (http://localhost:4200)
npm start
```

Other frontend commands:
```bash
npm run build                  # Production build -> dist/frontend
npm test -- --watch=false      # Run unit tests with Vitest
```

---

## Main API Endpoints (`/api/v1`)

| Module | Method & Path | Description |
| :--- | :--- | :--- |
| **Auth** | `POST /auth/register` | Register a new user |
| **Auth** | `POST /auth/login/json` | Login with email/username & password (JSON) |
| **Auth** | `POST /auth/login` | OAuth2 form login (Swagger Authorize) |
| **Users** | `GET /users/me` | Get current authenticated user |
| **Categories** | `GET /categories/` | List active categories |
| **Notes** | `GET /notes/` | List/filter notes (`category_id`, `seller_id`, `status`, `search`, etc.) |
| **Notes** | `GET /notes/{note_id}` | Get full note details |
| **Notes** | `POST /notes/` | Create a new note (authenticated) |
| **Notes** | `PATCH /notes/{note_id}` | Update a note (owner only) |
| **Notes** | `DELETE /notes/{note_id}` | Delete a note (owner only) |
| **Reviews** | `GET /notes/{note_id}/reviews` | List ratings & reviews for a note |
| **Reviews** | `POST /notes/{note_id}/reviews` | Submit or update a 1–5 star rating (authenticated) |
