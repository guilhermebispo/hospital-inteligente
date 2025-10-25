from __future__ import annotations

from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.db import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id: UUID = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    name: str = Column(String(150), nullable=False)
    email: str = Column(String(150), nullable=False, unique=True, index=True)
    crm: str = Column(String(30), nullable=False, unique=True, index=True)
    specialty: str = Column(String(120), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
