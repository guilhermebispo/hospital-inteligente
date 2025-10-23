from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_serializer, field_validator

from app.models.enums import RoleEnum


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str

    @field_validator("password", mode="before")
    @classmethod
    def coerce_password(cls, value: object) -> str:
        if value is None:
            raise ValueError("Password is required.")
        return str(value)

    @field_validator("role", mode="before")
    @classmethod
    def coerce_role(cls, value: object) -> str:
        if isinstance(value, dict):
            value = value.get("code")
        if isinstance(value, RoleEnum):
            return value.value
        if isinstance(value, str):
            return value
        raise ValueError("Invalid role.")


class UserUpdate(BaseModel):
    name: str
    email: EmailStr


class UserRoleUpdate(BaseModel):
    role: str

    @field_validator("role", mode="before")
    @classmethod
    def coerce_role(cls, value: object) -> str:
        if isinstance(value, dict):
            value = value.get("code")
        if isinstance(value, RoleEnum):
            return value.value
        if isinstance(value, str):
            return value
        raise ValueError("Invalid role.")


class UserPasswordUpdate(BaseModel):
    password: str

    @field_validator("password", mode="before")
    @classmethod
    def coerce_password(cls, value: object) -> str:
        if value is None:
            raise ValueError("Password is required.")
        return str(value)


class UserOut(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    password: str
    role: Optional[RoleEnum]
    created_at: datetime = Field(alias="createdAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    @field_serializer("role")
    def serialize_role(self, value: Optional[RoleEnum]) -> Optional[dict[str, str]]:
        if value is None:
            return None
        return {"code": value.value, "label": value.label}
