from __future__ import annotations

from typing import Optional, Sequence, Tuple
from uuid import UUID

from sqlalchemy import asc, desc, func, or_
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from app.models.enums import RoleEnum
from app.models.user import User
from app.security import password


class UserNotFoundError(NoResultFound):
    pass


class EmailAlreadyInUseError(ValueError):
    pass


def _apply_filters(query, role: Optional[str], text: Optional[str]):
    if role:
        query = query.filter(User.role == _parse_role(role))
    if text:
        lowered = f"%{text.lower()}%"
        query = query.filter(
            or_(
                func.lower(User.name).like(lowered),
                func.lower(User.email).like(lowered),
            )
        )
    return query


def _parse_role(value: str) -> RoleEnum:
    try:
        return RoleEnum(value)
    except ValueError as exc:
        raise ValueError("Invalid role.") from exc


def list_users(
    db: Session,
    *,
    page: int,
    size: int,
    role: Optional[str],
    text: Optional[str],
    sort_field: str,
    sort_direction: str,
) -> Tuple[Sequence[User], int]:
    query = db.query(User)
    query = _apply_filters(query, role, text)

    total = query.count()

    sort_attr = {
        "nome": User.name,
        "name": User.name,
        "email": User.email,
        "perfil": User.role,
        "role": User.role,
        "dataCriacao": User.created_at,
        "created_at": User.created_at,
    }.get(sort_field, User.name)

    direction = desc if sort_direction.lower() == "desc" else asc
    query = query.order_by(direction(sort_attr))

    offset = page * size
    items = query.offset(offset).limit(size).all()
    return items, total


def get_user(db: Session, user_id: UUID) -> User:
    user = db.query(User).filter_by(id=user_id).first()
    if user is None:
        raise UserNotFoundError("User not found")
    return user


def get_user_by_email(db: Session, email: str) -> User:
    user = db.query(User).filter(func.lower(User.email) == email.lower()).first()
    if user is None:
        raise UserNotFoundError("User not found")
    return user


def create_user(db: Session, payload: dict) -> User:
    payload = payload.copy()
    email = payload["email"].lower()

    if db.query(User).filter(func.lower(User.email) == email).first():
        raise EmailAlreadyInUseError("Email is already in use.")

    payload["email"] = email
    payload["password"] = password.hash_password(payload.pop("senha", payload.get("password")))
    payload["role"] = _parse_role(payload.pop("perfil", payload.get("role")))

    user = User(**payload)
    db.add(user)
    db.flush()
    return user


def update_user(db: Session, user_id: UUID, payload: dict) -> User:
    user = get_user(db, user_id)

    email = payload["email"].lower()
    if user.email != email:
        if db.query(User).filter(func.lower(User.email) == email).first():
            raise EmailAlreadyInUseError("Email is already in use.")
        user.email = email

    user.name = payload.get("name") or payload.get("nome") or user.name
    db.flush()
    return user


def change_role(db: Session, user_id: UUID, role_code: str) -> User:
    user = get_user(db, user_id)
    user.role = _parse_role(role_code)
    db.flush()
    return user


def change_password(db: Session, user_id: UUID, raw_password: str) -> User:
    user = get_user(db, user_id)
    user.password = password.hash_password(raw_password)
    db.flush()
    return user


def delete_user(db: Session, user_id: UUID) -> None:
    user = get_user(db, user_id)
    db.delete(user)
