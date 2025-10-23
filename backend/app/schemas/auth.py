from __future__ import annotations

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class Credentials(BaseModel):
    """User credentials required to obtain a JWT token."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "admin@hospital.com",
                "password": "123456",
            }
        }
    )

    email: EmailStr = Field(description="User e-mail used for login.")
    password: str = Field(description="Plain password that will be validated.")
