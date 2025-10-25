from __future__ import annotations

from enum import Enum


class RoleEnum(str, Enum):
    ADMIN = "ADMIN"
    DOCTOR = "DOCTOR"
    PATIENT = "PATIENT"

    @property
    def label(self) -> str:
        return {
            RoleEnum.ADMIN: "Administrator",
            RoleEnum.DOCTOR: "Doctor",
            RoleEnum.PATIENT: "Patient",
        }[self]


class GenderEnum(str, Enum):
    FEMALE = "FEMALE"
    MALE = "MALE"
    OTHER = "OTHER"

    @property
    def label(self) -> str:
        return {
            GenderEnum.FEMALE: "Female",
            GenderEnum.MALE: "Male",
            GenderEnum.OTHER: "Other / Not Informed",
        }[self]
