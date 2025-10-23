from __future__ import annotations

from pydantic import BaseModel, EmailStr


class Credenciais(BaseModel):
    email: EmailStr
    senha: str
