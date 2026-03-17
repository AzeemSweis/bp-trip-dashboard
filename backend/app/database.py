from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session

from app.config import settings

_is_sqlite = settings.database_url.startswith("sqlite")

_engine_kwargs = {
    "echo": False,
    "pool_pre_ping": True,
}

if _is_sqlite:
    from sqlalchemy.pool import StaticPool

    _engine_kwargs["connect_args"] = {"check_same_thread": False}
    # Use StaticPool for in-memory SQLite so all connections share the same DB
    if ":memory:" in settings.database_url:
        _engine_kwargs["poolclass"] = StaticPool

engine = create_engine(settings.database_url, **_engine_kwargs)

if _is_sqlite:
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, connection_record) -> None:
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
