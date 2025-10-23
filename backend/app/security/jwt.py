from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from jwt import ExpiredSignatureError, InvalidTokenError

from app.config import settings


def create_access_token(subject: str, expires_in_seconds: Optional[int] = None) -> str:
    expires_delta = expires_in_seconds or settings.jwt_expiration_seconds
    expire = datetime.now(tz=timezone.utc) + timedelta(seconds=expires_delta)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])


def validate_token(token: str) -> Optional[str]:
    try:
        payload = decode_token(token)
    except ExpiredSignatureError:
        return None
    except InvalidTokenError:
        return None

    return payload.get("sub")
