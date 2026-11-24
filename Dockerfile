# === STEP 1 === Build User Guide

FROM ghcr.io/astral-sh/uv:python3.14-trixie-slim AS guide_builder

RUN mkdir /guide

WORKDIR /guide

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=back/uv.lock,target=uv.lock \
    --mount=type=bind,source=back/pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --dev --all-extras

COPY back/docs /guide/docs
COPY back/mkdocs-guide.yml /guide/mkdocs-guide.yml

RUN uv run mkdocs build -f mkdocs-guide.yml -d /guide/out/

# === STEP 2 === Build Front End

FROM node:26-bookworm-slim AS frontend_builder

WORKDIR /front

RUN npm install --global pnpm@12

COPY front/package.json front/pnpm-lock.yaml front/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY front/ ./
RUN pnpm run build

# === STEP 3 === Build whombat

# Run the web server
# Use a Python image with uv pre-installed
FROM ghcr.io/astral-sh/uv:python3.14-trixie-slim AS builder

# Install the project into `/app`
WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy from the cache instead of linking since it's a mounted volume
ENV UV_LINK_MODE=copy

# Install the project's dependencies using the lockfile and settings
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=back/uv.lock,target=uv.lock \
    --mount=type=bind,source=back/pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev --all-extras

# Then, add the rest of the project source code and install it
# Installing separately from its dependencies allows optimal layer caching
COPY back/ /app/

# Copy the guide
COPY --from=guide_builder /guide/out/ /app/src/whombat/user_guide/

# Copy the statics
COPY --from=frontend_builder /front/out/ /app/src/whombat/statics/

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --all-extras

# === STEP 4 === Final Image

# Then, use a final image without uv
FROM python:3.14-slim-bookworm

# Install system dependencies.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libexpat1 \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Create the non-root application user and writable data directories.
RUN groupadd --system app \
    && useradd --system --gid app --home-dir /app --no-create-home app \
    && mkdir -p /audio /data \
    && chown app:app /audio /data

# Copy the application from the builder
COPY --from=builder --chown=app:app /app /app

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"

WORKDIR /app

VOLUME ["/data", "/audio"]

# Set the environment variables for the audio directory and the database URL
ENV WHOMBAT_AUDIO_DIR=/audio \
    WHOMBAT_DB_URL=sqlite+aiosqlite:////data/whombat.db \
    WHOMBAT_DEV=false \
    WHOMBAT_HOST=0.0.0.0 \
    WHOMBAT_PORT=5000 \
    WHOMBAT_LOG_LEVEL=info \
    WHOMBAT_LOG_TO_STDOUT=true \
    WHOMBAT_LOG_TO_FILE=false \
    WHOMBAT_OPEN_ON_STARTUP=false \
    WHOMBAT_DOMAIN=localhost

# Expose the port for the web server
EXPOSE 5000

# Check the API health endpoint using Python's standard library.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD python -c "import os; from urllib.request import urlopen; urlopen(f\"http://127.0.0.1:{os.environ.get('WHOMBAT_PORT', '5000')}/api/v1/health\", timeout=3)" || exit 1

# Reset the entrypoint, don't invoke `uv`
ENTRYPOINT []

USER app

# Run the command to start the web server
CMD ["whombat"]
