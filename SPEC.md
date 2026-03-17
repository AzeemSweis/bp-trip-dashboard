# Project: Backpacking Trip Dashboard

## Overview

A personal dashboard for organizing backpacking trips. The owner (Azeem) creates trips with dates, locations, trail links, and meeting points, then adds guests with individualized gear checklists. Each guest gets a unique shareable link to view their trip dashboard and check off gear items -- no guest login required. One admin account manages everything.

## Project Type

Webapp

## User Roles

### Admin (Azeem)
- Logs in with a single hardcoded admin account (email + password)
- Creates, edits, and deletes trips
- Adds and removes guests from trips
- Creates and manages per-guest checklists (add/remove/edit items)
- Views all guest checklist progress at a glance

### Guest (no login)
- Receives a unique link (e.g., `/trip/{trip_id}/guest/{guest_token}`)
- Views trip details: date, time, meeting point, map, trail links
- Views and checks off items on their personal checklist
- Cannot see other guests' checklists
- Cannot modify trip details

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS -- standard defaults, fast to build, good component model for dashboards
- **Backend**: Python + FastAPI -- lightweight, async, auto-generates OpenAPI docs
- **Database**: SQLite via SQLAlchemy -- single-user personal project, no need for Postgres
- **Auth**: JWT tokens for admin sessions, UUID tokens for guest links -- no OAuth complexity needed
- **Maps**: Leaflet + OpenStreetMap tiles -- free, no API key, good enough for showing a trailhead pin
- **Deployment**: Docker Compose -- single `docker compose up` to run everything

## Data Model

### trips
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | PK, autoincrement |
| name | TEXT | e.g., "Mt. Whitney Summit" |
| description | TEXT | Optional, general trip notes |
| start_date | DATE | Trip start date |
| end_date | DATE | Trip end date (nullable for day trips) |
| start_time | TIME | Meeting time |
| meeting_point_name | TEXT | e.g., "Walmart parking lot on Charleston" |
| meeting_point_lat | REAL | Nullable, for map pin |
| meeting_point_lng | REAL | Nullable, for map pin |
| trail_lat | REAL | Nullable, trailhead location for map |
| trail_lng | REAL | Nullable, trailhead location for map |
| created_at | DATETIME | Default now |
| updated_at | DATETIME | Default now, auto-update |

### trail_links
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | PK, autoincrement |
| trip_id | INTEGER | FK -> trips.id, ON DELETE CASCADE |
| label | TEXT | e.g., "AllTrails", "Recreation.gov Permit" |
| url | TEXT | Full URL |

### guests
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | PK, autoincrement |
| trip_id | INTEGER | FK -> trips.id, ON DELETE CASCADE |
| name | TEXT | Guest display name |
| token | TEXT | UUID4, unique -- used in shareable guest link |
| created_at | DATETIME | Default now |

### checklist_items
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | PK, autoincrement |
| guest_id | INTEGER | FK -> guests.id, ON DELETE CASCADE |
| label | TEXT | e.g., "Tent", "2L water" |
| is_checked | BOOLEAN | Default false |
| sort_order | INTEGER | For drag-to-reorder or manual ordering |

### admin_user
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | PK, autoincrement |
| email | TEXT | Unique |
| password_hash | TEXT | bcrypt hash |

Seeded on first run via environment variable or init script. Single row.

## API Contract

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | None | Admin login, returns JWT |

**POST /api/auth/login**
```
Request:  { "email": "string", "password": "string" }
Response: { "access_token": "string", "token_type": "bearer" }
```

### Trips (admin only)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/trips` | Admin | List all trips |
| POST | `/api/trips` | Admin | Create a trip |
| GET | `/api/trips/{trip_id}` | Admin | Get trip with guests + checklist progress |
| PUT | `/api/trips/{trip_id}` | Admin | Update trip details |
| DELETE | `/api/trips/{trip_id}` | Admin | Delete trip and all associated data |

**POST /api/trips**
```
Request: {
  "name": "string",
  "description": "string | null",
  "start_date": "2026-06-15",
  "end_date": "2026-06-16 | null",
  "start_time": "06:00",
  "meeting_point_name": "string",
  "meeting_point_lat": "number | null",
  "meeting_point_lng": "number | null",
  "trail_lat": "number | null",
  "trail_lng": "number | null",
  "trail_links": [{ "label": "string", "url": "string" }]
}
Response: { "id": 1, ...full trip object }
```

**GET /api/trips/{trip_id}** (admin view)
```
Response: {
  "id": 1,
  "name": "Mt. Whitney Summit",
  ...trip fields,
  "trail_links": [{ "id": 1, "label": "Recreation.gov", "url": "..." }],
  "guests": [
    {
      "id": 1,
      "name": "Jake",
      "token": "uuid",
      "checklist_progress": { "total": 12, "checked": 8 }
    }
  ]
}
```

### Trail Links (admin only)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/trips/{trip_id}/links` | Admin | Add a trail link |
| DELETE | `/api/trips/{trip_id}/links/{link_id}` | Admin | Remove a trail link |

### Guests (admin only)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/trips/{trip_id}/guests` | Admin | Add a guest |
| DELETE | `/api/trips/{trip_id}/guests/{guest_id}` | Admin | Remove guest + their checklist |

**POST /api/trips/{trip_id}/guests**
```
Request:  { "name": "string" }
Response: { "id": 1, "name": "Jake", "token": "abc123-uuid", "trip_id": 1 }
```

### Checklist Items (admin only for create/delete, guest can toggle)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/guests/{guest_id}/checklist` | Admin | Get all checklist items for a guest |
| POST | `/api/guests/{guest_id}/checklist` | Admin | Add item to guest's checklist |
| PUT | `/api/guests/{guest_id}/checklist/{item_id}` | Admin | Edit item label or sort order |
| DELETE | `/api/guests/{guest_id}/checklist/{item_id}` | Admin | Remove checklist item |

### Guest Public Endpoints (token auth via URL)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/guest/{guest_token}` | Token in URL | Get trip info + guest's checklist |
| PATCH | `/api/guest/{guest_token}/checklist/{item_id}` | Token in URL | Toggle checked status |

**GET /api/guest/{guest_token}**
```
Response: {
  "trip": {
    "name": "Mt. Whitney Summit",
    "start_date": "2026-06-15",
    "end_date": "2026-06-16",
    "start_time": "06:00",
    "meeting_point_name": "Walmart parking lot",
    "meeting_point_lat": 36.57,
    "meeting_point_lng": -118.29,
    "trail_lat": 36.58,
    "trail_lng": -118.29,
    "trail_links": [{ "label": "Recreation.gov", "url": "..." }]
  },
  "guest_name": "Jake",
  "checklist": [
    { "id": 1, "label": "Tent", "is_checked": true, "sort_order": 0 },
    { "id": 2, "label": "2L water", "is_checked": false, "sort_order": 1 }
  ]
}
```

**PATCH /api/guest/{guest_token}/checklist/{item_id}**
```
Request:  { "is_checked": true }
Response: { "id": 1, "label": "Tent", "is_checked": true, "sort_order": 0 }
```

## Frontend Pages

### Admin Pages (behind login)

1. **Login Page** (`/login`)
   - Email + password form
   - Redirects to dashboard on success

2. **Trip List** (`/admin/trips`)
   - Cards showing each trip: name, date, guest count, checklist progress
   - "Create Trip" button

3. **Trip Detail / Edit** (`/admin/trips/:tripId`)
   - Edit trip info (name, dates, time, meeting point, coordinates)
   - Manage trail links (add/remove)
   - Guest list with checklist progress bars
   - "Add Guest" button
   - Click guest to manage their checklist
   - Copy shareable guest link button

4. **Guest Checklist Manager** (`/admin/trips/:tripId/guests/:guestId`)
   - Add/remove/reorder checklist items
   - See current checked status
   - Copy shareable link for this guest

### Guest Pages (public, token-based)

5. **Guest Dashboard** (`/trip/:tripId/guest/:guestToken`)
   - Trip name, date, time prominently displayed
   - Meeting point with map pin (Leaflet)
   - Trail map pin (if coordinates provided)
   - Trail links as clickable buttons/cards
   - Personal checklist with checkboxes
   - Progress indicator (e.g., "8 of 12 items packed")

## Component Tree (key components)

```
App
├── AdminLayout (protected by auth)
│   ├── TripList
│   │   └── TripCard
│   ├── TripDetail
│   │   ├── TripInfoForm
│   │   ├── TrailLinksList
│   │   ├── GuestList
│   │   │   └── GuestRow (with progress bar + copy link)
│   │   └── AddGuestForm
│   └── GuestChecklistManager
│       ├── ChecklistItemRow
│       └── AddItemForm
├── LoginPage
└── GuestDashboard (public)
    ├── TripHeader (name, date, time)
    ├── MeetingPointCard (with MapEmbed)
    ├── TrailLinksCard
    ├── MapEmbed (Leaflet)
    └── GuestChecklist
        ├── ProgressBar
        └── ChecklistItem (checkbox + label)
```

## File Structure

```
bp-trip-dashboard/
├── SPEC.md
├── README.md
├── Makefile
├── docker-compose.yml
├── .env.example
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   └── versions/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app, CORS, lifespan
│   │   ├── config.py            # Settings from env vars
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── auth.py              # JWT creation/verification, password hashing
│   │   ├── models.py            # SQLAlchemy ORM models
│   │   ├── schemas.py           # Pydantic request/response models
│   │   ├── seed.py              # Create admin user on first run
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── auth.py          # POST /api/auth/login
│   │       ├── trips.py         # CRUD /api/trips
│   │       ├── guests.py        # CRUD /api/trips/{id}/guests
│   │       ├── checklist.py     # CRUD /api/guests/{id}/checklist
│   │       └── public.py        # GET/PATCH /api/guest/{token}
│   └── tests/
│       ├── conftest.py
│       ├── test_auth.py
│       ├── test_trips.py
│       ├── test_guests.py
│       └── test_checklist.py
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js               # Axios/fetch wrapper
│       ├── auth.js              # Auth context + token storage
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── TripList.jsx
│       │   ├── TripDetail.jsx
│       │   ├── GuestChecklistManager.jsx
│       │   └── GuestDashboard.jsx
│       └── components/
│           ├── AdminLayout.jsx
│           ├── TripCard.jsx
│           ├── TripInfoForm.jsx
│           ├── TrailLinksList.jsx
│           ├── GuestList.jsx
│           ├── GuestRow.jsx
│           ├── AddGuestForm.jsx
│           ├── ChecklistItemRow.jsx
│           ├── AddItemForm.jsx
│           ├── MapEmbed.jsx
│           ├── TripHeader.jsx
│           ├── MeetingPointCard.jsx
│           ├── TrailLinksCard.jsx
│           ├── GuestChecklist.jsx
│           ├── ProgressBar.jsx
│           └── ProtectedRoute.jsx
└── nginx/
    └── default.conf             # Reverse proxy: / -> frontend, /api -> backend
```

## Key Decisions

1. **No guest login** -- Guests access their dashboard via a unique UUID token in the URL. This removes the need for a user registration system, password resets, and all that complexity. The tradeoff is that anyone with the link can view/toggle the checklist, which is fine for a group of friends.

2. **Single admin user, seeded from env** -- No registration flow. The admin email and password are set via `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables and seeded into SQLite on first startup. Simple and appropriate for a single-owner app.

3. **Leaflet over Google Maps** -- Free, no API key, no billing. OpenStreetMap tiles are perfectly adequate for showing a trailhead pin and a meeting point pin.

4. **SQLite over Postgres** -- Single user, single server, low write volume. SQLite is zero-config and backed up by copying a file.

5. **Trail links as a separate table** -- A trip may link to recreation.gov, AllTrails, CalTopo, a permit page, etc. Keeping them as a list rather than a fixed field allows flexibility.

6. **Alembic for migrations** -- Even for SQLite, schema migrations prevent "just delete the DB" as the only upgrade path.

7. **Nginx reverse proxy in Docker Compose** -- Serves the frontend static build and proxies `/api` to the backend. One entry point, no CORS issues in production.

## Approved Additions (all included in build)

1. **Checklist templates** -- Save a "base gear list" (tent, sleeping bag, water, etc.) that can be applied to any guest on any trip, then customized per guest. Avoids re-entering the same 15 items for every guest on every trip.

2. **Trip status field** -- An enum (`planning`, `ready`, `completed`, `cancelled`) shown on the trip list to quickly see which trips are upcoming vs. done.

3. **"Copy all guest links" button** -- On the trip detail page, one button that copies all guest dashboard URLs to clipboard (formatted for pasting into a group text).

4. **Guest notes field** -- A free-text field per guest for things like "has bear canister" or "arriving 30 min late". Visible to admin only.

5. **Dark mode** -- Tailwind's dark mode support is near-free to implement. Useful for checking your phone at the trailhead at 5am.

## Implementation Order

1. **Backend: database models + migrations** -- Define SQLAlchemy models, configure Alembic, create initial migration, write seed script for admin user.
2. **Backend: auth** -- Login endpoint, JWT middleware, password hashing.
3. **Backend: trip CRUD** -- All trip and trail link endpoints with tests.
4. **Backend: guest + checklist CRUD** -- Guest management and checklist endpoints with tests.
5. **Backend: public guest endpoints** -- Token-based guest dashboard and checklist toggle.
6. **Frontend: project scaffold + routing** -- Vite + React + Tailwind + React Router setup, auth context, protected routes.
7. **Frontend: login + trip list** -- Admin login flow, trip list page with cards.
8. **Frontend: trip detail + guest management** -- Trip edit form, guest list, add guest, copy link.
9. **Frontend: guest checklist manager** -- Admin view to manage checklist items per guest.
10. **Frontend: guest dashboard** -- Public page with trip info, map, links, checklist.
11. **Infrastructure: Docker Compose + Nginx** -- Dockerfiles for frontend and backend, nginx config, compose file.
12. **Polish: loading states, error handling, mobile responsiveness.**

## Out of Scope

- Multi-user admin (only one admin account)
- Guest accounts or login
- Real-time collaboration / websockets
- File uploads (photos, GPX tracks)
- Payment or permit tracking
- Email or SMS notifications
- Mobile native app
- Offline support / PWA
- Calendar integration
