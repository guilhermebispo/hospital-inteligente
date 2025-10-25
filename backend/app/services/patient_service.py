from __future__ import annotations

from typing import Optional, Sequence, Tuple
from uuid import UUID

from sqlalchemy import asc, desc, func, or_
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from app.models.enums import GenderEnum, RoleEnum
from app.models.patient import Patient
from app.services import user_service
from app.services.user_service import EmailAlreadyInUseError


class PatientNotFoundError(NoResultFound):
    """Raised when a patient is not found in the database."""


class PatientEmailAlreadyInUseError(ValueError):
    """Raised when trying to create/update a patient with an e-mail already used by another patient."""


class PatientDocumentAlreadyInUseError(ValueError):
    """Raised when trying to reuse a document that already belongs to another patient."""


class PatientAlreadyLinkedToUserError(ValueError):
    """Raised when attempting to create another user for the same patient."""


def _parse_gender(value: Optional[str]) -> Optional[GenderEnum]:
    if value is None:
        return None
    try:
        return GenderEnum(value)
    except ValueError as exc:
        raise ValueError("Invalid gender. Allowed values: FEMALE, MALE, OTHER.") from exc


def _apply_filters(query, gender: Optional[str], text: Optional[str]):
    gender_enum = _parse_gender(gender) if gender else None
    if gender_enum:
        query = query.filter(Patient.gender == gender_enum)

    if text:
        lowered = f"%{text.lower()}%"
        query = query.filter(
            or_(
                func.lower(Patient.name).like(lowered),
                func.lower(Patient.email).like(lowered),
                func.lower(Patient.document).like(lowered),
            )
        )
    return query


def list_patients(
    db: Session,
    *,
    page: int,
    size: int,
    gender: Optional[str],
    text: Optional[str],
    sort_field: str,
    sort_direction: str,
) -> Tuple[Sequence[Patient], int]:
    query = db.query(Patient)
    query = _apply_filters(query, gender, text)

    total = query.count()

    sort_attr = {
        "name": Patient.name,
        "document": Patient.document,
        "email": Patient.email,
        "birthDate": Patient.birth_date,
        "createdAt": Patient.created_at,
    }.get(sort_field, Patient.name)

    direction = desc if sort_direction.lower() == "desc" else asc
    query = query.order_by(direction(sort_attr))

    offset = page * size
    items = query.offset(offset).limit(size).all()
    return items, total


def get_patient(db: Session, patient_id: UUID) -> Patient:
    patient = db.query(Patient).filter_by(id=patient_id).first()
    if patient is None:
        raise PatientNotFoundError("Patient not found.")
    return patient


def _ensure_unique_email(db: Session, email: str, ignore_patient_id: Optional[UUID] = None) -> None:
    query = db.query(Patient).filter(func.lower(Patient.email) == email.lower())
    if ignore_patient_id:
        query = query.filter(Patient.id != ignore_patient_id)
    if query.first():
        raise PatientEmailAlreadyInUseError("E-mail already used by another patient.")


def _ensure_unique_document(db: Session, document: str, ignore_patient_id: Optional[UUID] = None) -> None:
    query = db.query(Patient).filter(func.lower(Patient.document) == document.lower())
    if ignore_patient_id:
        query = query.filter(Patient.id != ignore_patient_id)
    if query.first():
        raise PatientDocumentAlreadyInUseError("Document already used by another patient.")


def create_patient(db: Session, payload: dict, *, create_portal_user: bool = True) -> Patient:
    payload = payload.copy()
    email = payload["email"].lower()
    document = payload["document"].lower()

    _ensure_unique_email(db, email)
    _ensure_unique_document(db, document)

    payload["email"] = email
    payload["document"] = document
    gender = _parse_gender(payload.get("gender"))
    if gender is None:
        raise ValueError("Gender is required.")
    payload["gender"] = gender

    patient = Patient(**payload)
    db.add(patient)
    db.flush()

    if create_portal_user:
        try:
            user = user_service.create_user(
                db,
                {
                    "name": patient.name,
                    "email": patient.email,
                    "password": "123456",
                    "role": RoleEnum.PATIENT.value,
                },
            )
            patient.user_id = user.id
            db.flush()
        except EmailAlreadyInUseError:
            patient.user_id = None

    return patient


def update_patient(db: Session, patient_id: UUID, payload: dict) -> Patient:
    patient = get_patient(db, patient_id)

    if "email" in payload and payload["email"]:
        email = payload["email"].lower()
        if email != patient.email:
            _ensure_unique_email(db, email, patient_id)
            patient.email = email

    if "document" in payload and payload["document"]:
        document = payload["document"].lower()
        if document != patient.document:
            _ensure_unique_document(db, document, patient_id)
            patient.document = document

    if "name" in payload and payload["name"]:
        patient.name = payload["name"]
    if "birth_date" in payload and payload["birth_date"]:
        patient.birth_date = payload["birth_date"]
    if "gender" in payload and payload["gender"]:
        patient.gender = _parse_gender(payload["gender"])
    if "phone" in payload:
        patient.phone = payload["phone"]
    if "notes" in payload:
        patient.notes = payload["notes"]

    db.flush()
    return patient


def delete_patient(db: Session, patient_id: UUID) -> None:
    patient = get_patient(db, patient_id)
    db.delete(patient)


def create_user_from_patient(db: Session, patient_id: UUID, default_password: str = "123456"):
    patient = get_patient(db, patient_id)
    if patient.user_id:
        raise PatientAlreadyLinkedToUserError("Patient already linked to a user.")

    try:
        user = user_service.create_user(
            db,
            {
                "name": patient.name,
                "email": patient.email,
                "password": default_password,
                "role": RoleEnum.PATIENT.value,
            },
        )
    except EmailAlreadyInUseError as exc:
        raise PatientEmailAlreadyInUseError("A user with this e-mail already exists.") from exc

    patient.user_id = user.id
    db.flush()
    return user
