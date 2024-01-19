ARG PYTHON_VERSION=3.10.1
FROM python:${PYTHON_VERSION}-slim-buster

LABEL maintainer="Penn Labs"

# Install build dependencies
RUN apt-get update && apt-get install --no-install-recommends -y gcc libpq-dev libc-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy mime definitions
COPY mime.types /etc/mime.types

# Install pipenv
RUN pip install pipenv

# Install poetry
RUN python3 -m venv /opt/poetry
RUN /opt/poetry/bin/pip install poetry
RUN /opt/poetry/bin/poetry --version
ENV PATH="/opt/poetry/bin:${PATH}"

# Copy run file
COPY django-run /usr/local/bin/

WORKDIR /app/

CMD ["/usr/local/bin/django-run"]
