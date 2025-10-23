from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.error_handlers import register_exception_handlers
from app.middleware import CorrelationIdMiddleware
from app.routers import auth, domains, users


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
        openapi_url="/v3/api-docs",
        docs_url="/swagger-ui",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allowed_origins,
        allow_credentials=settings.cors_allow_credentials,
        allow_methods=settings.cors_allowed_methods,
        allow_headers=settings.cors_allowed_headers,
        expose_headers=["Authorization", "X-Correlation-Id"],
    )
    app.add_middleware(CorrelationIdMiddleware)

    prefix = settings.api_prefix or ""
    app.include_router(auth.router, prefix=prefix)
    app.include_router(users.router, prefix=prefix)
    app.include_router(domains.router, prefix=prefix)

    register_exception_handlers(app)

    return app


app = create_app()
