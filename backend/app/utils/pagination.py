from __future__ import annotations

from math import ceil
from typing import Sequence, TypeVar

from app.schemas.common import PageResponse

T = TypeVar("T")


def build_page(content: Sequence[T], total: int, page: int, size: int) -> PageResponse[T]:
    size = max(size, 1)
    total_pages = ceil(total / size) if total else 0
    last = page >= (total_pages - 1) if total_pages else True
    return PageResponse[T](
        content=content,
        page=page,
        size=size,
        totalElements=total,
        totalPages=total_pages,
        last=last,
    )
