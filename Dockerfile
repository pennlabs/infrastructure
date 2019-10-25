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

CMD ["/usr/local/bin/django-run"]
