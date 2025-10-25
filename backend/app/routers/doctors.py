from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.enums import RoleEnum
from app.schemas.common import PageResponse
from app.schemas.doctor import DoctorCreate, DoctorOut, DoctorUpdate
from app.security.auth import require_roles
from app.services import doctor_service
from app.services.doctor_service import (
    DoctorCrmAlreadyInUseError,
    DoctorEmailAlreadyInUseError,
    DoctorNotFoundError,
)
from app.utils.pagination import build_page

router = APIRouter(prefix="/doctors", tags=["doctors"])

read_permission = require_roles(RoleEnum.ADMIN, RoleEnum.DOCTOR)
write_permission = require_roles(RoleEnum.ADMIN)


@router.get("", response_model=PageResponse[DoctorOut], summary="List doctors")
def list_doctors(
    page: int = Query(0, ge=0),
    size: int = Query(10, ge=1, le=100),
    sort: str = Query("name"),
    direction: str = Query("asc"),
    specialty: Optional[str] = Query(None),
    text: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: None = Depends(read_permission),
):
    doctors, total = doctor_service.list_doctors(
        db,
        page=page,
        size=size,
        specialty=specialty,
        text=text,
        sort_field=sort,
        sort_direction=direction,
    )
    dtos = [DoctorOut.model_validate(doc) for doc in doctors]
    return build_page(dtos, total=total, page=page, size=size)


@router.get("/{doctor_id}", response_model=DoctorOut, summary="Get doctor by ID")
def get_doctor(
    doctor_id: UUID,
    db: Session = Depends(get_db),
    _: None = Depends(read_permission),
):
    try:
        doctor = doctor_service.get_doctor(db, doctor_id)
    except DoctorNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return DoctorOut.model_validate(doctor)


@router.post("", response_model=DoctorOut, status_code=status.HTTP_201_CREATED, summary="Create doctor")
def create_doctor(
    payload: DoctorCreate,
    db: Session = Depends(get_db),
    _: None = Depends(write_permission),
):
    try:
        doctor = doctor_service.create_doctor(db, payload.model_dump())
    except DoctorEmailAlreadyInUseError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except DoctorCrmAlreadyInUseError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return DoctorOut.model_validate(doctor)


@router.put("/{doctor_id}", response_model=DoctorOut, summary="Update doctor")
def update_doctor(
    doctor_id: UUID,
    payload: DoctorUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(write_permission),
):
    try:
        doctor = doctor_service.update_doctor(db, doctor_id, payload.model_dump(exclude_unset=True))
    except DoctorNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except (DoctorEmailAlreadyInUseError, DoctorCrmAlreadyInUseError) as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return DoctorOut.model_validate(doctor)


@router.delete("/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete doctor")
def delete_doctor(
    doctor_id: UUID,
    db: Session = Depends(get_db),
    _: None = Depends(write_permission),
):
    try:
        doctor_service.delete_doctor(db, doctor_id)
    except DoctorNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
