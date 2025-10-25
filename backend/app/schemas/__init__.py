from app.schemas.auth import Credentials
from app.schemas.common import ApiError, ApiErrorDetail, Domain, PageResponse
from app.schemas.doctor import DoctorCreate, DoctorOut, DoctorUpdate
from app.schemas.patient import PatientCreate, PatientOut, PatientUpdate
from app.schemas.user import (
    UserCreate,
    UserOut,
    UserPasswordUpdate,
    UserRoleUpdate,
    UserUpdate,
)

__all__ = [
    "ApiError",
    "ApiErrorDetail",
    "Domain",
    "PageResponse",
    "PatientCreate",
    "PatientOut",
    "PatientUpdate",
    "DoctorCreate",
    "DoctorOut",
    "DoctorUpdate",
    "UserCreate",
    "UserOut",
    "UserRoleUpdate",
    "UserPasswordUpdate",
    "UserUpdate",
    "Credentials",
]
