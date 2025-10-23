from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.auth import Credentials
from app.services.auth_service import InvalidCredentialsError, authenticate

router = APIRouter(tags=["auth"])


@router.post(
    "/login",
    summary="Authenticate user",
    description=(
        "Validates the provided credentials and returns a JWT through the `Authorization` header.\n\n"
        "Default admin credentials: `admin@hospital.com` / `123456`."
    ),
    responses={
        200: {
            "description": "Authentication succeeded.",
            "content": {"application/json": {"example": {}}},
            "headers": {
                "Authorization": {
                    "description": "JWT token in the format `Bearer <token>`.",
                    "schema": {
                        "type": "string",
                        "example": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                }
            },
        },
        401: {"description": "Invalid credentials."},
    },
)
def login(credentials: Credentials, db: Session = Depends(get_db)) -> Response:
    """Authenticate the user and return the JWT in the `Authorization` header."""
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
