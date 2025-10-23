from __future__ import annotations

from typing import Callable, Iterable, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.enums import RoleEnum
from app.models.user import User
from app.security.jwt import validate_token

_http_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_http_bearer),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or not credentials.scheme.lower() == "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid credentials.")

    subject = validate_token(credentials.credentials)
    if subject is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid credentials.")

    user = db.query(User).filter(User.email == subject).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid credentials.")

    return user


def require_roles(*roles: RoleEnum | str) -> Callable[[User], User]:
    expected = {
        role if isinstance(role, str) else role.value
        for role in roles
    }

    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role.value not in expected:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not allowed to access this resource.")
        return user

    return dependency
