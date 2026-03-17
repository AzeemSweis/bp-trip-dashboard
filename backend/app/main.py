import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import SessionLocal, engine
from app.models import Base  # noqa: F401 — registers all models with metadata

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    Base.metadata.create_all(bind=engine)

    # Seed admin user
    from app.seed import seed_admin

    db = SessionLocal()
    try:
        seed_admin(db)
    finally:
        db.close()

    logger.info("Startup complete. Admin seeded.")
    yield
    logger.info("Shutdown.")


app = FastAPI(
    title="Backpacking Trip Dashboard API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────

from app.routers import auth, trips, guests, templates, public  # noqa: E402

app.include_router(auth.router)
app.include_router(trips.router)
app.include_router(guests.router)
app.include_router(templates.router)
app.include_router(public.router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
