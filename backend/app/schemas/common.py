from __future__ import annotations

from datetime import datetime
from typing import Generic, List, Optional, Sequence, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict
from pydantic.generics import GenericModel


class ApiErrorDetail(BaseModel):
    field: str
    message: str


class ApiError(BaseModel):
    timestamp: datetime
    status: int
    error: str
    code: str
    message: str
    path: str
    correlationId: Optional[str] = None
    details: Optional[List[ApiErrorDetail]] = None


T = TypeVar("T")


class PageResponse(GenericModel, Generic[T]):
    content: Sequence[T]
    page: int
    size: int
    totalElements: int
    totalPages: int
    last: bool


class Dominio(BaseModel):
    code: str
    label: str
