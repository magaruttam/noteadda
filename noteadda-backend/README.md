# NoteAdda Backend

The NoteAdda backend is a FastAPI application.

## Requirements

- Python 3.14 or newer
- [uv](https://docs.astral.sh/uv/)

## Run locally

From the `noteadda-backend` directory, install the project dependencies and start
the development server:

```bash
uv sync
uv run fastapi dev
```

The server starts at <http://127.0.0.1:8000>. Interactive API documentation is
available at <http://127.0.0.1:8000/docs>.

## API

- `GET /` — returns `{"message": "Hello World!"}`.