from __future__ import annotations

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.user import User
from app.security.jwt import create_access_token
from app.security.password import verify_password


class InvalidCredentialsError(Exception):
    pass


def authenticate(db: Session, *, email: str, password: str) -> str:
    user = db.query(User).filter(func.lower(User.email) == email.lower()).first()
    if user is None or not verify_password(password, user.password):
        raise InvalidCredentialsError("Invalid credentials.")

    return create_access_token(user.email)
