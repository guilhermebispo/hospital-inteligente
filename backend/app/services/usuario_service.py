from __future__ import annotations

from typing import Optional, Sequence, Tuple
from uuid import UUID

from sqlalchemy import asc, desc, func, or_
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from app.models.enums import PerfilEnum
from app.models.usuario import Usuario
from app.security import password


class UsuarioNotFoundError(NoResultFound):
    pass


class EmailAlreadyInUseError(ValueError):
    pass


def _apply_filters(query, perfil: Optional[str], texto: Optional[str]):
    if perfil:
        query = query.filter(Usuario.perfil == _parse_perfil(perfil))
    if texto:
        lowered = f"%{texto.lower()}%"
        query = query.filter(
            or_(
                func.lower(Usuario.nome).like(lowered),
                func.lower(Usuario.email).like(lowered),
            )
        )
    return query


def _parse_perfil(value: str) -> PerfilEnum:
    try:
        return PerfilEnum(value)
    except ValueError as exc:
        raise ValueError("Perfil inválido.") from exc


def list_usuarios(
    db: Session,
    *,
    page: int,
    size: int,
    perfil: Optional[str],
    texto: Optional[str],
    sort_field: str,
    sort_direction: str,
) -> Tuple[Sequence[Usuario], int]:
    query = db.query(Usuario)
    query = _apply_filters(query, perfil, texto)

    total = query.count()

    sort_attr = {
        "nome": Usuario.nome,
        "email": Usuario.email,
        "dataCriacao": Usuario.data_criacao,
    }.get(sort_field, Usuario.nome)

    direction = desc if sort_direction.lower() == "desc" else asc
    query = query.order_by(direction(sort_attr))

    offset = page * size
    items = query.offset(offset).limit(size).all()
    return items, total


def get_usuario(db: Session, usuario_id: UUID) -> Usuario:
    usuario = db.query(Usuario).filter_by(id=usuario_id).first()
    if usuario is None:
        raise UsuarioNotFoundError("Usuário não encontrado")
    return usuario


def get_usuario_por_email(db: Session, email: str) -> Usuario:
    usuario = db.query(Usuario).filter(func.lower(Usuario.email) == email.lower()).first()
    if usuario is None:
        raise UsuarioNotFoundError("Usuário não encontrado")
    return usuario


def criar_usuario(db: Session, payload: dict) -> Usuario:
    payload = payload.copy()
    email = payload["email"].lower()

    if db.query(Usuario).filter(func.lower(Usuario.email) == email).first():
        raise EmailAlreadyInUseError("Já existe um usuário cadastrado com este e-mail.")

    payload["email"] = email
    payload["senha"] = password.hash_password(payload["senha"])
    payload["perfil"] = _parse_perfil(payload["perfil"])

    usuario = Usuario(**payload)
    db.add(usuario)
    db.flush()
    return usuario


def atualizar_usuario(db: Session, usuario_id: UUID, payload: dict) -> Usuario:
    usuario = get_usuario(db, usuario_id)

    email = payload["email"].lower()
    if usuario.email != email:
        if db.query(Usuario).filter(func.lower(Usuario.email) == email).first():
            raise EmailAlreadyInUseError("Já existe um usuário cadastrado com este e-mail.")
        usuario.email = email

    usuario.nome = payload["nome"]
    db.flush()
    return usuario


def alterar_perfil(db: Session, usuario_id: UUID, perfil_code: str) -> Usuario:
    usuario = get_usuario(db, usuario_id)
    usuario.perfil = _parse_perfil(perfil_code)
    db.flush()
    return usuario


def alterar_senha(db: Session, usuario_id: UUID, senha: str) -> Usuario:
    usuario = get_usuario(db, usuario_id)
    usuario.senha = password.hash_password(senha)
    db.flush()
    return usuario


def deletar_usuario(db: Session, usuario_id: UUID) -> None:
    usuario = get_usuario(db, usuario_id)
    db.delete(usuario)
