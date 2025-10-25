from __future__ import annotations

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_serializer, field_validator

from app.models.enums import GenderEnum


class PatientBase(BaseModel):
    name: str = Field(description="Nome completo do paciente.")
    email: EmailStr = Field(description="E-mail para contato.")
    document: str = Field(description="Documento principal (ex.: CPF).")
    birth_date: date = Field(description="Data de nascimento.")
    gender: str = Field(description="Sexo biológico/identidade. Valores: FEMALE, MALE, OTHER.")
    phone: Optional[str] = Field(default=None, description="Telefone de contato.")
    notes: Optional[str] = Field(default=None, description="Observações gerais.")

    @field_validator("document")
    @classmethod
    def normalize_document(cls, value: str) -> str:
        return value.strip()

    @field_validator("gender", mode="before")
    @classmethod
    def coerce_gender(cls, value: object) -> str:
        if isinstance(value, dict):
            value = value.get("code")
        if isinstance(value, GenderEnum):
            return value.value
        if isinstance(value, str):
            return value.upper()
        raise ValueError("Invalid gender value.")


class PatientCreate(PatientBase):
    """Payload utilizado para cadastrar pacientes."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Maria Souza",
                "email": "maria@hospital.com",
                "document": "123.456.789-00",
                "birth_date": "1990-05-10",
                "gender": "FEMALE",
                "phone": "(11) 99999-0000",
                "notes": "Paciente diabética.",
            }
        }
    )


class PatientUpdate(BaseModel):
    """Payload aceito para atualizar pacientes."""

    name: Optional[str] = Field(default=None, description="Nome completo.")
    email: Optional[EmailStr] = Field(default=None, description="E-mail para contato.")
    document: Optional[str] = Field(default=None, description="Documento principal.")
    birth_date: Optional[date] = Field(default=None, description="Data de nascimento.")
    gender: Optional[str] = Field(default=None, description="Valores: FEMALE, MALE, OTHER.")
    phone: Optional[str] = Field(default=None, description="Telefone.")
    notes: Optional[str] = Field(default=None, description="Observações.")

    @field_validator("document")
    @classmethod
    def normalize_document(cls, value: str) -> str:
        return value.strip()

    @field_validator("gender", mode="before")
    @classmethod
    def coerce_gender(cls, value: object) -> Optional[str]:
        if value is None:
            return None
        if isinstance(value, dict):
            value = value.get("code")
        if isinstance(value, GenderEnum):
            return value.value
        if isinstance(value, str):
            return value.upper()
        raise ValueError("Invalid gender value.")


class PatientOut(BaseModel):
    """Representação pública dos pacientes."""

    id: UUID
    name: str
    email: EmailStr
    document: str
    birth_date: date = Field(alias="birthDate")
    gender: Optional[GenderEnum] = None
    phone: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(alias="createdAt")
    user_id: Optional[UUID] = Field(default=None, alias="userId")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    @field_validator("gender", mode="before")
    @classmethod
    def parse_gender(cls, value: object) -> Optional[GenderEnum]:
        if value is None or isinstance(value, GenderEnum):
            return value
        if isinstance(value, dict):
            value = value.get("code")
        if isinstance(value, str):
            return GenderEnum(value)
        raise ValueError("Invalid gender value")

    @field_serializer("gender")
    def gender_to_dict(self, value: Optional[GenderEnum]):
        if value is None:
            return None
        return {"code": value.value, "label": value.label}
