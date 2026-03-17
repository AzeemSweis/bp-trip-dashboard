# syntax=docker/dockerfile:1

# ---- builder ----
FROM python:3.9-slim AS builder

WORKDIR /app

# Install deps into a prefix we can copy cleanly
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ---- runtime ----
FROM python:3.9-slim AS runtime

# Non-root user; UID/GID 1000 avoids conflicts with most host systems
RUN groupadd --gid 1000 appgroup && \
    useradd --uid 1000 --gid appgroup --no-create-home appuser

WORKDIR /app

# Pull installed packages from builder stage
COPY --from=builder /install /usr/local

# App source
COPY app/ ./app/
COPY alembic/ ./alembic/
COPY alembic.ini .

# SQLite lives here; mount a named volume at this path for persistence
RUN mkdir -p /app/data && chown appuser:appgroup /app/data

USER appuser

EXPOSE 8000

# Uvicorn with a single worker is appropriate for SQLite — concurrent writes
# through SQLAlchemy's connection pool would serialize anyway.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
