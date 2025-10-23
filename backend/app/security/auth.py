from __future__ import annotations

from typing import Callable, Iterable, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.enums import PerfilEnum
from app.models.usuario import Usuario
from app.security.jwt import validate_token

_http_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_http_bearer),
    db: Session = Depends(get_db),
) -> Usuario:
    if credentials is None or not credentials.scheme.lower() == "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais ausentes ou inválidas.")

    subject = validate_token(credentials.credentials)
    if subject is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais ausentes ou inválidas.")

    user = db.query(Usuario).filter(Usuario.email == subject).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais ausentes ou inválidas.")

    return user


def require_roles(*roles: PerfilEnum | str) -> Callable[[Usuario], Usuario]:
    expected = {
        role if isinstance(role, str) else role.value
        for role in roles
    }

    def dependency(user: Usuario = Depends(get_current_user)) -> Usuario:
        if user.perfil.value not in expected:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Você não tem permissão para acessar este recurso.")
        return user

    return dependency
