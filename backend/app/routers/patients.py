from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.enums import RoleEnum
from app.schemas.common import PageResponse
from app.schemas.patient import PatientCreate, PatientOut, PatientUpdate
from app.schemas.user import UserOut
from app.security.auth import require_roles
from app.services import patient_service
from app.services.patient_service import (
    PatientDocumentAlreadyInUseError,
    PatientEmailAlreadyInUseError,
    PatientNotFoundError,
    PatientAlreadyLinkedToUserError,
)
from app.utils.pagination import build_page

router = APIRouter(prefix="/patients", tags=["patients"])

read_permission = require_roles(RoleEnum.ADMIN, RoleEnum.DOCTOR)
write_permission = require_roles(RoleEnum.ADMIN, RoleEnum.DOCTOR)


@router.get(
    "",
    response_model=PageResponse[PatientOut],
    summary="Lista pacientes com paginação",
)
def list_patients(
    page: int = Query(0, ge=0, description="Página desejada (base zero)."),
    size: int = Query(10, ge=1, le=100, description="Quantidade por página."),
    sort: str = Query("name", description="Campo de ordenação."),
    direction: str = Query("asc", description="Direção asc/desc."),
    gender: Optional[str] = Query(None, description="Filtrar por gênero: FEMALE, MALE, OTHER."),
    text: Optional[str] = Query(None, description="Filtro aplicado em nome/e-mail/documento."),
    db: Session = Depends(get_db),
    _: None = Depends(read_permission),
):
    items, total = patient_service.list_patients(
        db,
        page=page,
        size=size,
        gender=gender,
        text=text,
        sort_field=sort,
        sort_direction=direction,
    )
    dtos = [PatientOut.model_validate(item) for item in items]
    return build_page(dtos, total=total, page=page, size=size)


@router.get(
    "/{patient_id}",
    response_model=PatientOut,
    summary="Obtém paciente por ID",
)
def get_patient(
    patient_id: UUID,
    db: Session = Depends(get_db),
    _: None = Depends(read_permission),
):
    try:
        patient = patient_service.get_patient(db, patient_id)
    except PatientNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return PatientOut.model_validate(patient)


@router.post(
    "",
    response_model=PatientOut,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastra paciente",
)
def create_patient(
    payload: PatientCreate,
    db: Session = Depends(get_db),
    _: None = Depends(write_permission),
):
    try:
        patient = patient_service.create_patient(db, payload.model_dump())
    except (PatientEmailAlreadyInUseError, PatientDocumentAlreadyInUseError) as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return PatientOut.model_validate(patient)


@router.put(
    "/{patient_id}",
    response_model=PatientOut,
    summary="Atualiza paciente",
)
def update_patient(
    patient_id: UUID,
    payload: PatientUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(write_permission),
):
    try:
        patient = patient_service.update_patient(db, patient_id, payload.model_dump(exclude_unset=True))
    except PatientNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except (PatientEmailAlreadyInUseError, PatientDocumentAlreadyInUseError) as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return PatientOut.model_validate(patient)


@router.delete(
    "/{patient_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove paciente",
)
def delete_patient(
    patient_id: UUID,
    db: Session = Depends(get_db),
    _: None = Depends(write_permission),
):
    try:
        patient_service.delete_patient(db, patient_id)
    except PatientNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post(
    "/{patient_id}/create-user",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Cria um usuário a partir do paciente",
)
def create_user_from_patient(
    patient_id: UUID,
    db: Session = Depends(get_db),
    _: None = Depends(write_permission),
):
    try:
        user = patient_service.create_user_from_patient(db, patient_id)
    except PatientNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except PatientAlreadyLinkedToUserError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except PatientEmailAlreadyInUseError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    return UserOut.model_validate(user)
