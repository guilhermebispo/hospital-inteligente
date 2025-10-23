from __future__ import annotations

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.usuario import Usuario
from app.security.jwt import create_access_token
from app.security.password import verify_password


class InvalidCredentialsError(Exception):
    pass


def authenticate(db: Session, *, email: str, senha: str) -> str:
    user = db.query(Usuario).filter(func.lower(Usuario.email) == email.lower()).first()
    if user is None or not verify_password(senha, user.senha):
        raise InvalidCredentialsError("Credenciais ausentes ou inválidas.")

    return create_access_token(user.email)
