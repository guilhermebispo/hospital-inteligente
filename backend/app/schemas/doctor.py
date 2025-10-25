from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class DoctorBase(BaseModel):
    name: str = Field(description="Nome completo do médico.")
    email: EmailStr = Field(description="E-mail profissional.")
    crm: str = Field(description="Número do registro CRM.")
    specialty: str = Field(description="Especialidade principal.")


class DoctorCreate(DoctorBase):
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "name": "Dra. Paula Andrade",
            "email": "paula.andrade@hospital.com",
            "crm": "CRM-SP 123456",
            "specialty": "Cardiologia",
        }
    })


class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    crm: Optional[str] = None
    specialty: Optional[str] = None


class DoctorOut(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    crm: str
    specialty: str
    created_at: datetime = Field(alias="createdAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
