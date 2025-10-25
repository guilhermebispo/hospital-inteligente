from __future__ import annotations

from typing import Optional, Sequence, Tuple
from uuid import UUID

from sqlalchemy import asc, desc, func, or_
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from app.models.doctor import Doctor
from app.models.enums import RoleEnum
from app.services import user_service
from app.services.user_service import EmailAlreadyInUseError


class DoctorNotFoundError(NoResultFound):
    """Raised when a doctor is not found."""


class DoctorEmailAlreadyInUseError(ValueError):
    """Raised when trying to reuse an e-mail."""


class DoctorCrmAlreadyInUseError(ValueError):
    """Raised when trying to reuse a CRM."""


def _apply_filters(query, specialty: Optional[str], text: Optional[str]):
    if specialty:
        query = query.filter(func.lower(Doctor.specialty) == specialty.lower())
    if text:
        lowered = f"%{text.lower()}%"
        query = query.filter(
            or_(
                func.lower(Doctor.name).like(lowered),
                func.lower(Doctor.email).like(lowered),
                func.lower(Doctor.crm).like(lowered),
            )
        )
    return query


def list_doctors(
    db: Session,
    *,
    page: int,
    size: int,
    specialty: Optional[str],
    text: Optional[str],
    sort_field: str,
    sort_direction: str,
) -> Tuple[Sequence[Doctor], int]:
    query = db.query(Doctor)
    query = _apply_filters(query, specialty, text)

    total = query.count()

    sort_attr = {
        "name": Doctor.name,
        "email": Doctor.email,
        "crm": Doctor.crm,
        "specialty": Doctor.specialty,
        "createdAt": Doctor.created_at,
    }.get(sort_field, Doctor.name)

    direction = desc if sort_direction.lower() == "desc" else asc
    query = query.order_by(direction(sort_attr))

    offset = page * size
    doctors = query.offset(offset).limit(size).all()
    return doctors, total


def get_doctor(db: Session, doctor_id: UUID) -> Doctor:
    doctor = db.query(Doctor).filter_by(id=doctor_id).first()
    if doctor is None:
        raise DoctorNotFoundError("Doctor not found")
    return doctor


def _ensure_unique_email(db: Session, email: str, ignore_id: Optional[UUID] = None):
    query = db.query(Doctor).filter(func.lower(Doctor.email) == email.lower())
    if ignore_id:
        query = query.filter(Doctor.id != ignore_id)
    if query.first():
        raise DoctorEmailAlreadyInUseError("E-mail already used by another doctor.")


def _ensure_unique_crm(db: Session, crm: str, ignore_id: Optional[UUID] = None):
    query = db.query(Doctor).filter(func.lower(Doctor.crm) == crm.lower())
    if ignore_id:
        query = query.filter(Doctor.id != ignore_id)
    if query.first():
        raise DoctorCrmAlreadyInUseError("CRM already used by another doctor.")


def create_doctor(db: Session, payload: dict, *, create_portal_user: bool = True) -> Doctor:
    payload = payload.copy()
    email = payload["email"].lower()
    crm = payload["crm"].lower()

    _ensure_unique_email(db, email)
    _ensure_unique_crm(db, crm)

    payload["email"] = email
    payload["crm"] = crm

    doctor = Doctor(**payload)
    db.add(doctor)
    db.flush()

    if create_portal_user:
        try:
            user_service.create_user(
                db,
                {
                    "name": doctor.name,
                    "email": doctor.email,
                    "password": "123456",
                    "role": RoleEnum.DOCTOR.value,
                },
            )
        except EmailAlreadyInUseError:
            pass

    return doctor


def update_doctor(db: Session, doctor_id: UUID, payload: dict) -> Doctor:
    doctor = get_doctor(db, doctor_id)

    if "email" in payload and payload["email"]:
        email = payload["email"].lower()
        if email != doctor.email:
            _ensure_unique_email(db, email, doctor_id)
            doctor.email = email

    if "crm" in payload and payload["crm"]:
        crm = payload["crm"].lower()
        if crm != doctor.crm:
            _ensure_unique_crm(db, crm, doctor_id)
            doctor.crm = crm

    if "name" in payload and payload["name"]:
        doctor.name = payload["name"]

    if "specialty" in payload and payload["specialty"]:
        doctor.specialty = payload["specialty"]

    db.flush()
    return doctor


def delete_doctor(db: Session, doctor_id: UUID) -> None:
    doctor = get_doctor(db, doctor_id)
    db.delete(doctor)
