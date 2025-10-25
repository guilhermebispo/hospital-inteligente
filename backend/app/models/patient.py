from __future__ import annotations

from datetime import date
from uuid import UUID, uuid4

from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.db import Base
from app.models.enums import GenderEnum


class Patient(Base):
    __tablename__ = "patients"

    id: UUID = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    name: str = Column(String(150), nullable=False)
    email: str = Column(String(150), nullable=False, unique=True, index=True)
    document: str = Column(String(20), nullable=False, unique=True, index=True)
    birth_date: date = Column(Date, nullable=False)
    gender: GenderEnum = Column(
        Enum(GenderEnum, name="gender_enum", native_enum=False, create_constraint=False),
        nullable=False,
    )
    phone: str = Column(String(20), nullable=True)
    notes: str = Column(Text, nullable=True)
    user_id: UUID | None = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, unique=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
