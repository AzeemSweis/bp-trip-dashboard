import json
from pathlib import Path
from typing import Union

from pydantic import field_validator
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

    cors_origins: Union[str, list[str]] = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("["):
                return json.loads(v)
            # Accept comma-separated: "https://foo.com,https://bar.com"
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = SettingsConfigDict(env_file=str(_env_file), env_file_encoding="utf-8", extra="ignore")


settings = Settings()
