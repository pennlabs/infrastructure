FROM python:3-slim

LABEL maintainer="Penn Labs"

RUN apt-get update && apt-get install --no-install-recommends -y gcc \
    && rm -rf /var/lib/apt/lists/*

RUN pip install pipenv 

WORKDIR /app/

COPY Pipfile* /app/

RUN pipenv install --system

COPY . /app/

CMD ["/usr/local/bin/python3", "sync/sync.py"]
