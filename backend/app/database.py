from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.config import settings

# For in-memory SQLite, use StaticPool so all connections share the same DB
_extra_kwargs = {}
if ":memory:" in settings.database_url:
    _extra_kwargs["poolclass"] = StaticPool

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
    echo=False,
    **_extra_kwargs,
)


@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record) -> None:
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    if ":memory:" not in settings.database_url:
        cursor.execute("PRAGMA journal_mode=WAL")
    cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Session:  # type: ignore[return]
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
