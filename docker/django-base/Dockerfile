ARG PYTHON_VERSION=3.10
FROM python:${PYTHON_VERSION}-slim-bookworm

LABEL maintainer="Penn Labs"

# Install build dependencies
RUN apt-get update && apt-get install --no-install-recommends -y gcc libpq-dev libc-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy mime definitions
COPY mime.types /etc/mime.types

# Install uv
COPY --from=ghcr.io/astral-sh/uv@sha256:2381d6aa60c326b71fd40023f921a0a3b8f91b14d5db6b90402e65a635053709 /uv /uvx /bin/

# Copy run file
COPY django-run /usr/local/bin/

WORKDIR /app/

CMD ["/usr/local/bin/django-run"]
