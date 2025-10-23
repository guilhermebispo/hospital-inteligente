from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_serializer, field_validator

from app.models.enums import RoleEnum


class UserCreate(BaseModel):
    """Payload to register a new user (administrator, doctor, or patient)."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Hospital Administrator",
                "email": "admin@hospital.com",
                "password": "123456",
                "role": "ADMIN",
            }
        }
    )

    name: str = Field(description="Full name of the user.")
    email: EmailStr = Field(description="Unique e-mail used for login.")
    password: str = Field(description="Initial password assigned to the user.")
    role: str = Field(description="Access role. Allowed values: ADMIN, DOCTOR, PATIENT.")

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
    """Payload accepted when editing basic user information."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Ana Souza",
                "email": "ana.souza@hospital.com",
            }
        }
    )

    name: str = Field(description="Updated full name.")
    email: EmailStr = Field(description="Updated e-mail (must remain unique).")


class UserRoleUpdate(BaseModel):
    """Payload used to modify only the access role of a user."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "role": "DOCTOR",
            }
        }
    )

    role: str = Field(description="New access role. Allowed values: ADMIN, DOCTOR, PATIENT.")

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
    """Payload to update the password of an existing user."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "password": "NewSecurePassword123",
            }
        }
    )

    password: str = Field(description="New password to replace the current one.")

    @field_validator("password", mode="before")
    @classmethod
    def coerce_password(cls, value: object) -> str:
        if value is None:
            raise ValueError("Password is required.")
        return str(value)


class UserOut(BaseModel):
    """Public representation of a user in API responses."""

    id: UUID = Field(description="Unique identifier (UUID).")
    name: str = Field(description="User full name.")
    email: EmailStr = Field(description="Unique e-mail registered in the system.")
    password: str = Field(description="Password hash stored internally.")
    role: Optional[RoleEnum] = Field(description="Associated access role.")
    created_at: datetime = Field(alias="createdAt", description="Creation timestamp.")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    @field_serializer("role")
    def serialize_role(self, value: Optional[RoleEnum]) -> Optional[dict[str, str]]:
        if value is None:
            return None
        return {"code": value.value, "label": value.label}
