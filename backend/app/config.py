from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Look for .env in CWD first, then project root (one level up from backend/)
_env_file = Path(".env")
if not _env_file.exists():
    _parent_env = Path(__file__).resolve().parent.parent.parent / ".env"
    if _parent_env.exists():
        _env_file = _parent_env


class Settings(BaseSettings):
    database_url: str = "postgresql://localhost/bp_trip_dashboard"
    secret_key: str  # Required — no default
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours

    admin_email: str  # Required — no default
    admin_password: str  # Required — no default

    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=str(_env_file), env_file_encoding="utf-8", extra="ignore")


settings = Settings()
