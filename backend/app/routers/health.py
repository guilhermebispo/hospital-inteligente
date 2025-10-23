from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from app.schemas.common import HealthStatus

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    response_model=HealthStatus,
    summary="Service health check",
    description="Provides a lightweight status payload for uptime monitors.",
)
def health() -> HealthStatus:
    """Return a simple heartbeat payload used for infrastructure checks."""
    return HealthStatus(timestamp=datetime.now(timezone.utc))
