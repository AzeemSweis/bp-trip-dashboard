"""Simple in-memory rate limiter for login attempts."""

import time
from collections import defaultdict
from typing import Tuple

from fastapi import HTTPException, Request, status

# Max attempts per window
MAX_ATTEMPTS = 5
WINDOW_SECONDS = 60

# ip -> list of timestamps
_attempts: dict[str, list[float]] = defaultdict(list)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _prune(ip: str) -> None:
    cutoff = time.monotonic() - WINDOW_SECONDS
    _attempts[ip] = [t for t in _attempts[ip] if t > cutoff]


def check_rate_limit(request: Request) -> None:
    ip = _client_ip(request)
    _prune(ip)
    if len(_attempts[ip]) >= MAX_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many login attempts. Try again in {WINDOW_SECONDS} seconds.",
        )


def record_attempt(request: Request) -> None:
    ip = _client_ip(request)
    _attempts[ip].append(time.monotonic())
