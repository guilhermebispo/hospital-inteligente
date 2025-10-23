from __future__ import annotations

from enum import Enum


class PerfilEnum(str, Enum):
    ADMIN = "ADMIN"
    USER = "USER"

    @property
    def label(self) -> str:
        return {
            PerfilEnum.ADMIN: "Administrador",
            PerfilEnum.USER: "Usuário",
        }[self]
