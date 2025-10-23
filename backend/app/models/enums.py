from __future__ import annotations

from enum import Enum


class PerfilEnum(str, Enum):
    ADMIN = "ADMIN"
    MEDICO = "MEDICO"
    PACIENTE = "PACIENTE"

    @property
    def label(self) -> str:
        return {
            PerfilEnum.ADMIN: "Administrador",
            PerfilEnum.MEDICO: "Médico",
            PerfilEnum.PACIENTE: "Paciente",
        }[self]
