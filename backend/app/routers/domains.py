from __future__ import annotations

from fastapi import APIRouter, Depends

from app.models.enums import RoleEnum
from app.schemas.common import Domain
from app.security.auth import require_roles

router = APIRouter(prefix="/domains", tags=["domains"])

read_permission = require_roles(RoleEnum.ADMIN, RoleEnum.DOCTOR, RoleEnum.PATIENT)


def _to_domain(enum_cls):
    """Convert an enum into a list of Domain objects."""
    return [Domain(code=item.value, label=item.label) for item in enum_cls]


@router.get(
    "/roles",
    response_model=list[Domain],
    summary="List available roles",
    description="Returns the complete set of roles accepted by the platform.",
)
def list_roles(_: None = Depends(read_permission)):
    """Expose the RoleEnum values as code/label pairs."""
    return _to_domain(RoleEnum)
