from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.enums import PerfilEnum
from app.schemas.common import PageResponse
from app.schemas.usuario import (
    UsuarioCreate,
    UsuarioOut,
    UsuarioPerfilUpdate,
    UsuarioSenhaUpdate,
    UsuarioUpdate,
)
from app.security.auth import require_roles
from app.services import usuario_service
from app.services.usuario_service import EmailAlreadyInUseError, UsuarioNotFoundError
from app.utils.pagination import build_page

router = APIRouter(prefix="/users", tags=["users"])

read_permission = require_roles(PerfilEnum.ADMIN, PerfilEnum.USER)
write_permission = require_roles(PerfilEnum.ADMIN)


@router.get("", response_model=PageResponse[UsuarioOut])
def listar(
    page: int = Query(0, ge=0),
    size: int = Query(10, ge=1, le=100),
    sort: str = Query("nome"),
    direction: str = Query("asc"),
    perfil: Optional[str] = Query(None),
    texto: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: None = Depends(read_permission),
):
    items, total = usuario_service.list_usuarios(
        db,
        page=page,
        size=size,
        perfil=perfil,
        texto=texto,
        sort_field=sort,
        sort_direction=direction,
    )

    dtos = [UsuarioOut.model_validate(item) for item in items]
    return build_page(dtos, total=total, page=page, size=size)


@router.get("/{usuario_id}", response_model=UsuarioOut)
def buscar_por_id(
    usuario_id: UUID,
    db: Session = Depends(get_db),
    _: None = Depends(read_permission),
):
    try:
        usuario = usuario_service.get_usuario(db, usuario_id)
    except UsuarioNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return UsuarioOut.model_validate(usuario)


@router.get("/email/{email}", response_model=UsuarioOut)
def buscar_por_email(
    email: str,
    db: Session = Depends(get_db),
    _: None = Depends(read_permission),
):
    try:
        usuario = usuario_service.get_usuario_por_email(db, email)
    except UsuarioNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return UsuarioOut.model_validate(usuario)


@router.post("", response_model=UsuarioOut)
def criar(
    payload: UsuarioCreate,
    db: Session = Depends(get_db),
    _: None = Depends(write_permission),
):
    try:
        usuario = usuario_service.criar_usuario(db, payload.model_dump())
    except EmailAlreadyInUseError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return UsuarioOut.model_validate(usuario)


@router.put("/{usuario_id}", response_model=UsuarioOut)
def atualizar(
    usuario_id: UUID,
    payload: UsuarioUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(write_permission),
):
    try:
        usuario = usuario_service.atualizar_usuario(db, usuario_id, payload.model_dump())
    except UsuarioNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except EmailAlreadyInUseError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return UsuarioOut.model_validate(usuario)


@router.patch("/{usuario_id}/perfil", response_model=UsuarioOut)
def alterar_perfil(
    usuario_id: UUID,
    payload: UsuarioPerfilUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(write_permission),
):
    try:
        usuario = usuario_service.alterar_perfil(db, usuario_id, payload.perfil)
    except UsuarioNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return UsuarioOut.model_validate(usuario)


@router.patch("/{usuario_id}/senha", response_model=UsuarioOut)
def alterar_senha(
    usuario_id: UUID,
    payload: UsuarioSenhaUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(write_permission),
):
    try:
        usuario = usuario_service.alterar_senha(db, usuario_id, payload.senha)
    except UsuarioNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return UsuarioOut.model_validate(usuario)


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(
    usuario_id: UUID,
    db: Session = Depends(get_db),
    _: None = Depends(write_permission),
):
    try:
        usuario_service.deletar_usuario(db, usuario_id)
    except UsuarioNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
