from __future__ import annotations

from datetime import datetime
from typing import Generic, List, Optional, Sequence, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field
from pydantic.generics import GenericModel


class ApiErrorDetail(BaseModel):
    """Represents a single field-level validation issue."""

    field: str
    message: str


class ApiError(BaseModel):
    """Standard error envelope returned by the API when a request fails."""

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
    """Generic wrapper used for paginated responses."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "content": [],
                "page": 0,
                "size": 10,
                "totalElements": 0,
                "totalPages": 0,
                "last": True,
            }
        }
    )

    content: Sequence[T]
    page: int
    size: int
    totalElements: int
    totalPages: int
    last: bool


class Domain(BaseModel):
    """Key/value pair used to populate dropdowns and selectors."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "code": "ADMIN",
                "label": "Administrator",
            }
        }
    )

    code: str
    label: str


class HealthStatus(BaseModel):
    """Simple status payload returned by the health check endpoint."""

    status: str = Field(default="ok", description="Service health indicator.")
    timestamp: datetime = Field(description="UTC timestamp when the status was generated.")
