from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./data/app.db"
    secret_key: str  # Required — no default, app will fail to start without it
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours

    admin_email: str  # Required — no default
    admin_password: str  # Required — no default

    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
