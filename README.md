# Backpacking Trip Dashboard

A personal dashboard for organizing backpacking trips. Create trips with dates and locations, add guests with individualized gear checklists, and share unique links so guests can view their trip info and track what they need to pack.

## Features

- **Admin trip management**: Create, edit, and delete trips with dates, times, meeting points, and coordinates
- **Guest checklists**: Add individualized gear checklists per guest, viewable and editable by the admin
- **Shareable guest links**: Each guest gets a unique UUID-based link to their trip dashboard — no login required
- **Checklist templates**: Reusable gear lists that can be applied to any guest and customized
- **Trip status tracking**: Label trips as planning, ready, completed, or cancelled
- **Maps**: Leaflet-based map pins for meeting points and trailheads
- **Trail links**: Attach multiple links per trip (AllTrails, Recreation.gov, permits, etc.)
- **Dark mode**: Built-in light/dark theme toggle
- **Single admin account**: One hardcoded admin user managed via environment variables

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Leaflet
- **Backend**: Python + FastAPI + SQLAlchemy
- **Database**: SQLite
- **Auth**: JWT for admin sessions, UUID tokens for guest links
- **Deployment**: Docker Compose + Nginx reverse proxy

## Quick Start

### Docker Compose (recommended)

```bash
git clone https://github.com/asweis/bp-trip-dashboard.git
cd bp-trip-dashboard
cp .env.example .env
# Edit .env: set ADMIN_EMAIL, ADMIN_PASSWORD, SECRET_KEY
docker compose up --build
```

Open http://localhost and log in with your admin credentials.

### Local Development (no Docker)

```bash
git clone https://github.com/asweis/bp-trip-dashboard.git
cd bp-trip-dashboard
cp .env.example .env
make dev
```

This starts the FastAPI backend on `http://localhost:8000` and Vite dev server on `http://localhost:5173` in parallel.

## Local Development

### Backend (FastAPI)

```bash
cd backend
python3.9 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at http://localhost:8000/docs (Swagger UI).

### Frontend (React + Vite)

```bash
cd frontend
npm ci
npm run dev
```

Dev server on http://localhost:5173 with hot reload.

### Running Tests

```bash
make test
```

Runs pytest on the backend test suite.

### Linting

```bash
make lint
```

Runs ESLint on frontend and ruff/flake8 on backend.

## Project Structure

```
bp-trip-dashboard/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app setup, CORS, lifespan
│   │   ├── config.py         # Settings from env vars
│   │   ├── database.py       # SQLAlchemy engine + session
│   │   ├── auth.py           # JWT, password hashing
│   │   ├── models.py         # ORM models (Trip, Guest, ChecklistItem, etc.)
│   │   ├── schemas.py        # Pydantic request/response schemas
│   │   ├── seed.py           # Admin user seeding
│   │   └── routers/
│   │       ├── auth.py       # POST /api/auth/login
│   │       ├── trips.py      # Trip CRUD
│   │       ├── guests.py     # Guest management
│   │       ├── checklist.py  # Checklist items
│   │       └── public.py     # Token-based guest endpoints
│   ├── requirements.txt
│   ├── Dockerfile
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── TripList.jsx
│   │   │   ├── TripDetail.jsx
│   │   │   ├── GuestChecklistManager.jsx
│   │   │   └── GuestDashboard.jsx
│   │   ├── components/       # Reusable UI components
│   │   ├── api.js            # API client wrapper
│   │   ├── auth.js           # Auth context + token storage
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── nginx/
│   └── default.conf          # Reverse proxy config
├── Makefile
├── docker-compose.yml
└── .env.example
```

## API Overview

Full API documentation is available at `/docs` (Swagger UI) when the backend is running.

### Admin Endpoints (JWT authenticated)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Admin login, returns JWT token |
| GET | `/api/trips` | List all trips |
| POST | `/api/trips` | Create a trip |
| GET | `/api/trips/{id}` | Get trip with guests and checklist progress |
| PUT | `/api/trips/{id}` | Update trip details |
| DELETE | `/api/trips/{id}` | Delete trip and all associated data |
| POST | `/api/trips/{id}/links` | Add a trail link |
| DELETE | `/api/trips/{id}/links/{link_id}` | Remove a trail link |
| POST | `/api/trips/{id}/guests` | Add a guest |
| DELETE | `/api/trips/{id}/guests/{guest_id}` | Remove a guest |
| GET | `/api/guests/{guest_id}/checklist` | Get guest's checklist items |
| POST | `/api/guests/{guest_id}/checklist` | Add item to guest's checklist |
| PUT | `/api/guests/{guest_id}/checklist/{item_id}` | Edit checklist item |
| DELETE | `/api/guests/{guest_id}/checklist/{item_id}` | Delete checklist item |

### Guest Endpoints (token-based, public)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/guest/{guest_token}` | Get trip info and guest's checklist |
| PATCH | `/api/guest/{guest_token}/checklist/{item_id}` | Toggle checklist item checked status |

## Environment Variables

Copy `.env.example` to `.env` and set the following:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite connection string | `sqlite:///./data/app.db` |
| `SECRET_KEY` | JWT signing key (use a long random string) | `your-secret-key-here` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token expiration | `1440` (24 hours) |
| `ADMIN_EMAIL` | Admin account email | `admin@example.com` |
| `ADMIN_PASSWORD` | Admin account password (seeded on first run) | `changeme` |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | `["http://localhost:5173","http://localhost:3000"]` |

## Making Changes

See [SPEC.md](SPEC.md) for the full project specification, including data model, API contract, and implementation details.

## Common Tasks

### Reset the database

```bash
# Docker Compose
docker compose down -v  # Remove the named volume
docker compose up --build

# Local dev
rm backend/data/app.db
make dev
```

### Backup the SQLite database

```bash
docker run --rm -v bp-trip-dashboard_sqlite_data:/data \
  -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz /data
```

### View logs

```bash
docker compose logs -f backend    # Backend logs
docker compose logs -f frontend   # Frontend build logs
docker compose logs -f nginx      # Nginx logs
```

## Deployment

The `docker-compose.yml` is configured for production use. To deploy:

1. Copy `.env.example` to `.env` on the production server
2. Update `.env` with production values (strong passwords, proper origins, real domain)
3. Run `docker compose up -d`
4. Access the app at http://your-domain

For HTTPS, add an Nginx reverse proxy or use a load balancer in front of this stack.
