from __future__ import annotations

from typing import Callable
from uuid import uuid4

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    header = "X-Correlation-Id"

    async def dispatch(self, request: Request, call_next: Callable[[Request], Response]) -> Response:
        correlation_id = request.headers.get(self.header, "") or str(uuid4())
        request.state.correlation_id = correlation_id

        response = await call_next(request)
        response.headers[self.header] = correlation_id
        return response
