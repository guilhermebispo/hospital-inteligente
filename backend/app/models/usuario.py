from __future__ import annotations

from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, Enum, String, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.db import Base
from app.models.enums import PerfilEnum


class Usuario(Base):
    __tablename__ = "tb_usuario"

    id: UUID = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    nome: str = Column(String(150), nullable=False)
    email: str = Column(String(120), nullable=False, unique=True, index=True)
    senha: str = Column(String(255), nullable=False)
    perfil: PerfilEnum = Column(
        Enum(PerfilEnum, name="perfil_enum", native_enum=False, create_constraint=False),
        nullable=False,
    )
    data_criacao = Column(DateTime, nullable=False, server_default=func.now())
