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


@router.get(
    "",
    response_model=PageResponse[UserOut],
    summary="List users with pagination",
    description=(
        "Returns a page of users filtered by role or free text. "
        "You may try the default admin `admin@hospital.com` to explore the listing."
    ),
)
def list_users(
    page: int = Query(0, ge=0, description="Desired page (zero-based index)."),
    size: int = Query(10, ge=1, le=100, description="Number of items per page."),
    sort: str = Query("name", description="Field used to sort results."),
    direction: str = Query("asc", description="Sort direction: asc or desc."),
    role: Optional[str] = Query(None, description="Filter by role: ADMIN, DOCTOR, PATIENT."),
    text: Optional[str] = Query(None, description="Free-text filter applied to name and e-mail."),
    db: Session = Depends(get_db),
    _: None = Depends(read_permission),
):
    """Return paginated users applying optional filters."""
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


@router.get(
    "/{user_id}",
    response_model=UserOut,
    summary="Retrieve user by ID",
    description="Fetch the full record of a user identified by UUID.",
    responses={
        404: {"description": "User not found."},
    },
)
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


@router.get(
    "/email/{email}",
    response_model=UserOut,
    summary="Retrieve user by e-mail",
    description="Fetch a user by the exact e-mail registered in the system.",
    responses={
        404: {"description": "User not found for the provided e-mail."},
    },
)
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


@router.post(
    "",
    response_model=UserOut,
    summary="Create a new user",
    description="Registers a new user (e.g., a new doctor) and returns the created record.",
    responses={
        200: {
            "description": "User created successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "id": "11111111-1111-1111-1111-111111111111",
                        "name": "Hospital Administrator",
                        "email": "admin@hospital.com",
                        "password": "$2a$10$ps9xsYOBRI4dKG/be.RF4O4Ady0PvTSmjfKTFpXKykU4fIZWg8QhW",
                        "role": {"code": "ADMIN", "label": "Administrator"},
                        "createdAt": "2025-01-01T12:00:00Z",
                    }
                }
            },
        },
        400: {"description": "Invalid payload."},
        409: {"description": "E-mail already registered."},
    },
)
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


@router.put(
    "/{user_id}",
    response_model=UserOut,
    summary="Update user",
    description="Replaces the basic information (name and e-mail) of an existing user.",
    responses={
        400: {"description": "Invalid payload."},
        404: {"description": "User not found."},
        409: {"description": "E-mail already used by another user."},
    },
)
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


@router.patch(
    "/{user_id}/role",
    response_model=UserOut,
    summary="Change user role",
    description="Updates only the access role of an existing user.",
    responses={
        400: {"description": "Provided role is invalid."},
        404: {"description": "User not found."},
    },
)
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


@router.patch(
    "/{user_id}/password",
    response_model=UserOut,
    summary="Change user password",
    description="Replaces the current password with a new value. Useful after the first admin login.",
    responses={
        400: {"description": "Invalid password."},
        404: {"description": "User not found."},
    },
)
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


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete user",
    description="Permanently removes the user identified by UUID.",
    responses={
        204: {"description": "User removed successfully."},
        404: {"description": "User not found."},
    },
)
def delete(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: None = Depends(write_permission),
):
    try:
        user_service.delete_user(db, user_id)
    except UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
