from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app.schemas.common import ApiError, ApiErrorDetail

_STATUS_CODE_MAPPING = {
    status.HTTP_400_BAD_REQUEST: ("Bad Request", "ERR_BAD_REQUEST"),
    status.HTTP_401_UNAUTHORIZED: ("Unauthorized", "ERR_UNAUTHORIZED"),
    status.HTTP_403_FORBIDDEN: ("Forbidden", "ERR_FORBIDDEN"),
    status.HTTP_404_NOT_FOUND: ("Not Found", "ERR_NOT_FOUND"),
    status.HTTP_405_METHOD_NOT_ALLOWED: ("Method Not Allowed", "ERR_METHOD_NOT_ALLOWED"),
    status.HTTP_409_CONFLICT: ("Conflict", "ERR_CONFLICT"),
    status.HTTP_422_UNPROCESSABLE_ENTITY: ("Unprocessable Entity", "ERR_VALIDATION"),
    status.HTTP_500_INTERNAL_SERVER_ERROR: ("Internal Server Error", "ERR_INTERNAL"),
}


def _build_error(
    *,
    request: Request,
    status_code: int,
    message: str,
    code: str,
    error: str,
    details: List[ApiErrorDetail] | None = None,
) -> Dict[str, Any]:
    correlation_id = getattr(request.state, "correlation_id", None)

    payload = ApiError(
        timestamp=datetime.now(timezone.utc),
        status=status_code,
        error=error,
        code=code,
        message=message,
        path=request.url.path,
        correlationId=correlation_id,
        details=details,
    )
    return payload.model_dump(mode="json", by_alias=True)


async def _validation_exception_handler(request: Request, exc: RequestValidationError) -> Response:
    details = []
    for err in exc.errors():
        loc = err.get("loc", [])
        if loc and loc[0] == "body":
            loc = loc[1:]
        field = ".".join(str(part) for part in loc if part not in {"body"})
        details.append(ApiErrorDetail(field=field, message=err.get("msg", "Valor inválido.")))

    body = _build_error(
        request=request,
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        message="Dados inválidos.",
        code="ERR_VALIDATION",
        error="Unprocessable Entity",
        details=details,
    )
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content=body)


async def _http_exception_handler(request: Request, exc: HTTPException) -> Response:
    status_code = exc.status_code
    message = exc.detail if isinstance(exc.detail, str) else "Requisição inválida."
    error, code = _STATUS_CODE_MAPPING.get(status_code, ("Error", "ERR_GENERIC"))

    body = _build_error(
        request=request,
        status_code=status_code,
        message=message,
        code=code,
        error=error,
    )
    return JSONResponse(status_code=status_code, content=body)


async def _integrity_error_handler(request: Request, exc: IntegrityError) -> Response:
    body = _build_error(
        request=request,
        status_code=status.HTTP_409_CONFLICT,
        message="Violação de integridade de dados.",
        code="ERR_CONFLICT",
        error="Conflict",
    )
    return JSONResponse(status_code=status.HTTP_409_CONFLICT, content=body)


async def _generic_exception_handler(request: Request, exc: Exception) -> Response:
    body = _build_error(
        request=request,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="Erro inesperado. Se o problema persistir, contate o suporte.",
        code="ERR_INTERNAL",
        error="Internal Server Error",
    )
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=body)


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(RequestValidationError, _validation_exception_handler)
    app.add_exception_handler(HTTPException, _http_exception_handler)
    app.add_exception_handler(IntegrityError, _integrity_error_handler)
    app.add_exception_handler(Exception, _generic_exception_handler)
