from __future__ import annotations

from pydantic import BaseModel, EmailStr


class Credentials(BaseModel):
    email: EmailStr
    password: str
