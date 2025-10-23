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
