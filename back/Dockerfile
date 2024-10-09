FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

WORKDIR /code

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --dev --all-extras

ADD . /code

RUN mkdir /audio
RUN mkdir /data

VOLUME ["/data"]

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

ENV WHOMBAT_AUDIO_DIR /audio
ENV WHOMBAT_HOST="0.0.0.0"
ENV WHOMBAT_DOMAIN="localhost"
ENV WHOMBAT_DB_URL="sqlite+aiosqlite:////data/whombat.db"
ENV PATH="/code/.venv/bin:$PATH"

# Run the command to start the web server
CMD ["whombat"]
