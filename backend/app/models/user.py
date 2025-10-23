from __future__ import annotations

from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, Enum, String, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.db import Base
from app.models.enums import RoleEnum


class User(Base):
    __tablename__ = "users"

    id: UUID = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    name: str = Column("name", String(150), nullable=False)
    email: str = Column(String(120), nullable=False, unique=True, index=True)
    password: str = Column("password", String(255), nullable=False)
    role: RoleEnum = Column(
        "role",
        Enum(RoleEnum, name="role_enum", native_enum=False, create_constraint=False),
        nullable=False,
    )
    created_at = Column("created_at", DateTime, nullable=False, server_default=func.now())
