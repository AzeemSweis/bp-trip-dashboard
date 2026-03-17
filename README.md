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
- **Database**: Supabase Postgres (SQLite for local dev)
- **Auth**: JWT for admin sessions, UUID tokens for guest links
- **Deployment**: Vercel (frontend) + Render (backend) + Supabase (database)

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

This starts the FastAPI backend on `http://localhost:8000` and Vite dev server on `http://localhost:5173` in parallel. Local dev uses SQLite — no Postgres setup needed.

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

## Production Deployment

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the project settings, copy the **Direct connection string** (postgres://...)
3. Store this securely — you'll need it for the backend

### 2. Deploy the backend to Render

1. Push the repository to GitHub
2. In Render, create a new **Web Service** from the GitHub repo, select the `backend/` directory
3. Set the environment variables:
   - `DATABASE_URL`: Your Supabase connection string from step 1
   - `SECRET_KEY`: A long random string for JWT signing
   - `ADMIN_EMAIL`: Your admin account email
   - `ADMIN_PASSWORD`: A strong admin password
   - `CORS_ORIGINS`: Set to `["https://your-vercel-domain.vercel.app"]` (you'll update this after step 3)
4. Deploy and note the Render backend URL (e.g., `https://your-backend.onrender.com`)

### 3. Deploy the frontend to Vercel

1. In Vercel, create a new project from your GitHub repo
2. Set **Root Directory** to `frontend/`
3. Set the environment variable:
   - `VITE_API_URL`: Set to `https://your-backend.onrender.com/api` (replace with your Render URL from step 2)
4. Deploy and note your Vercel domain

### 4. Update CORS on Render

Return to Render and update the `CORS_ORIGINS` environment variable with your Vercel domain:
```
["https://your-vercel-domain.vercel.app"]
```

Redeploy the backend.

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
| `DATABASE_URL` | Postgres connection string (Supabase) or SQLite for local dev | `postgresql://user:pass@db.example.com/dbname` or `sqlite:///./data/app.db` |
| `SECRET_KEY` | JWT signing key (use a long random string) | `your-secret-key-here` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token expiration | `1440` (24 hours) |
| `ADMIN_EMAIL` | Admin account email | `admin@example.com` |
| `ADMIN_PASSWORD` | Admin account password (seeded on first run) | `changeme` |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | `["https://your-domain.vercel.app"]` |

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

### Backup the SQLite database (local dev only)

```bash
cp backend/data/app.db backend/data/app.db.backup
```

### View logs (Docker Compose)

```bash
docker compose logs -f backend    # Backend logs
docker compose logs -f frontend   # Frontend build logs
docker compose logs -f nginx      # Nginx logs
```

### View logs (production)

- **Render backend**: View in the Render dashboard under "Logs"
- **Vercel frontend**: View in the Vercel dashboard under "Deployments"
- **Supabase database**: No manual backup needed — automated backups included
