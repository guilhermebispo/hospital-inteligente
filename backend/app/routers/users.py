from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.enums import RoleEnum
from app.schemas.common import PageResponse
from app.schemas.user import (
    UserCreate,
    UserOut,
    UserPasswordUpdate,
    UserRoleUpdate,
    UserUpdate,
)
from app.security.auth import require_roles
from app.services import user_service
from app.services.user_service import EmailAlreadyInUseError, UserNotFoundError
from app.utils.pagination import build_page

router = APIRouter(prefix="/users", tags=["users"])

read_permission = require_roles(RoleEnum.ADMIN, RoleEnum.DOCTOR, RoleEnum.PATIENT)
write_permission = require_roles(RoleEnum.ADMIN)


@router.get("", response_model=PageResponse[UserOut])
def list_users(
    page: int = Query(0, ge=0),
    size: int = Query(10, ge=1, le=100),
    sort: str = Query("name"),
    direction: str = Query("asc"),
    role: Optional[str] = Query(None),
    text: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: None = Depends(read_permission),
):
    items, total = user_service.list_users(
        db,
        page=page,
        size=size,
        role=role,
        text=text,
        sort_field=sort,
        sort_direction=direction,
    )

    dtos = [UserOut.model_validate(item) for item in items]
    return build_page(dtos, total=total, page=page, size=size)


@router.get("/{user_id}", response_model=UserOut)
def get_by_id(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: None = Depends(read_permission),
):
    try:
        user = user_service.get_user(db, user_id)
    except UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return UserOut.model_validate(user)


@router.get("/email/{email}", response_model=UserOut)
def get_by_email(
    email: str,
    db: Session = Depends(get_db),
    _: None = Depends(read_permission),
):
    try:
        user = user_service.get_user_by_email(db, email)
    except UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return UserOut.model_validate(user)


@router.post("", response_model=UserOut)
def create(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _: None = Depends(write_permission),
):
    try:
        user = user_service.create_user(db, payload.model_dump())
    except EmailAlreadyInUseError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return UserOut.model_validate(user)


@router.put("/{user_id}", response_model=UserOut)
def update(
    user_id: UUID,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(write_permission),
):
    try:
        user = user_service.update_user(db, user_id, payload.model_dump())
    except UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except EmailAlreadyInUseError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return UserOut.model_validate(user)


@router.patch("/{user_id}/role", response_model=UserOut)
def change_role(
    user_id: UUID,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(write_permission),
):
    try:
        user = user_service.change_role(db, user_id, payload.role)
    except UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return UserOut.model_validate(user)


@router.patch("/{user_id}/password", response_model=UserOut)
def change_password(
    user_id: UUID,
    payload: UserPasswordUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(write_permission),
):
    try:
        user = user_service.change_password(db, user_id, payload.password)
    except UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return UserOut.model_validate(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: None = Depends(write_permission),
):
    try:
        user_service.delete_user(db, user_id)
    except UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
