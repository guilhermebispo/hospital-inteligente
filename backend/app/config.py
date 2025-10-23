from __future__ import annotations

import os
from functools import lru_cache
from typing import List, Optional

from pydantic import BaseModel, Field


class Settings(BaseModel):
    app_name: str = Field(default_factory=lambda: os.getenv("APP_NAME", "Hospital Inteligente API"))
    api_prefix: str = Field(default_factory=lambda: os.getenv("API_PREFIX", ""))
    debug: bool = Field(default_factory=lambda: os.getenv("DEBUG", "false").lower() == "true")

    database_url: str = Field(
        default_factory=lambda: os.getenv(
            "DATABASE_URL",
            "postgresql+psycopg://hospital_user:hospital_pass@localhost:5434/hospital_db",
        ),
        description="SQLAlchemy connection URL",
    )

    jwt_secret_key: str = Field(
        default_factory=lambda: os.getenv("JWT_SECRET", "L9k9M9W9bQXdd6cojXruU2pZTd7rsiAjpCB")
    )
    jwt_algorithm: str = Field(default_factory=lambda: os.getenv("JWT_ALGORITHM", "HS256"))
    jwt_expiration_ms: int = Field(
        default_factory=lambda: int(os.getenv("JWT_EXPIRATION_MS", "86400000"))
    )

    cors_allowed_origins: List[str] = Field(
        default_factory=lambda: [
            origin.strip()
            for origin in os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:4200").split(",")
            if origin.strip()
        ]
    )
    cors_allow_credentials: bool = Field(
        default_factory=lambda: os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"
    )
    cors_allowed_methods: List[str] = Field(
        default_factory=lambda: [
            method.strip()
            for method in os.getenv(
                "CORS_ALLOWED_METHODS", "GET,POST,PUT,PATCH,DELETE,OPTIONS"
            ).split(",")
            if method.strip()
        ]
    )
    cors_allowed_headers: List[str] = Field(
        default_factory=lambda: [
            header.strip()
            for header in os.getenv(
                "CORS_ALLOWED_HEADERS", "Authorization,Content-Type,Accept,Origin"
            ).split(",")
            if header.strip()
        ]
    )

    @property
    def jwt_expiration_seconds(self) -> int:
        return self.jwt_expiration_ms // 1000


@lru_cache(maxsize=1)
def get_settings(overrides: Optional[dict] = None) -> Settings:
    data = Settings().model_dump()
    if overrides:
        data.update(overrides)
    return Settings.model_validate(data)


settings = get_settings()
