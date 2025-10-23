from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_serializer, field_validator

from app.models.enums import PerfilEnum


class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    perfil: str

    @field_validator("senha", mode="before")
    @classmethod
    def coerce_password(cls, value: object) -> str:
        if value is None:
            raise ValueError("Senha é obrigatória.")
        return str(value)

    @field_validator("perfil", mode="before")
    @classmethod
    def coerce_perfil(cls, value: object) -> str:
        if isinstance(value, dict):
            value = value.get("code")
        if isinstance(value, PerfilEnum):
            return value.value
        if isinstance(value, str):
            return value
        raise ValueError("Perfil inválido.")


class UsuarioUpdate(BaseModel):
    nome: str
    email: EmailStr


class UsuarioPerfilUpdate(BaseModel):
    perfil: str

    @field_validator("perfil", mode="before")
    @classmethod
    def coerce_perfil(cls, value: object) -> str:
        if isinstance(value, dict):
            value = value.get("code")
        if isinstance(value, PerfilEnum):
            return value.value
        if isinstance(value, str):
            return value
        raise ValueError("Perfil inválido.")


class UsuarioSenhaUpdate(BaseModel):
    senha: str

    @field_validator("senha", mode="before")
    @classmethod
    def coerce_password(cls, value: object) -> str:
        if value is None:
            raise ValueError("Senha é obrigatória.")
        return str(value)


class UsuarioOut(BaseModel):
    id: UUID
    nome: str
    email: EmailStr
    senha: str
    perfil: Optional[PerfilEnum]
    data_criacao: datetime = Field(alias="dataCriacao")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    @field_serializer("perfil")
    def serialize_perfil(self, value: Optional[PerfilEnum]) -> Optional[dict[str, str]]:
        if value is None:
            return None
        return {"code": value.value, "label": value.label}
