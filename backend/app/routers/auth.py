from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.auth import Credentials
from app.services.auth_service import InvalidCredentialsError, authenticate

router = APIRouter(tags=["auth"])


@router.post("/login")
def login(credentials: Credentials, db: Session = Depends(get_db)) -> Response:
    try:
        token = authenticate(db, email=credentials.email, password=credentials.password)
    except InvalidCredentialsError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    response = Response(content="{}", media_type="application/json")
    response.headers["Authorization"] = f"Bearer {token}"
    return response
