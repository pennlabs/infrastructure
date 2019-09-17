FROM python:3-slim

MAINTAINER Penn Labs

# Install build dependencies
RUN apt-get update && apt-get install --no-install-recommends -y default-libmysqlclient-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Install pipenv
RUN pip install pipenv 

# Copy run file
COPY django-run /usr/local/bin/

WORKDIR /app/

# Copy project dependencies
ONBUILD COPY Pipfile* /app/

# Install project dependencies
ONBUILD RUN pipenv install --system

# Copy project files
ONBUILD COPY . /app/

# Collect static files
ONBUILD RUN python /app/manage.py collectstatic --noinput

CMD ["django-run"]
