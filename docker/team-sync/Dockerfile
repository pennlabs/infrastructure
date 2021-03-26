FROM python:3-slim

LABEL maintainer="Penn Labs"

RUN apt-get update && apt-get install --no-install-recommends -y gcc wget unzip ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN pip install pipenv 

RUN wget -qO bw.zip "https://github.com/bitwarden/cli/releases/download/v1.15.1/bw-linux-1.15.1.zip" \
    && unzip bw.zip && rm -f bw.zip && chmod +x bw && mv bw /usr/local/bin
WORKDIR /app/

COPY Pipfile* /app/

RUN pipenv install --system

COPY . /app/

CMD ["/usr/local/bin/python3", "sync/sync.py"]
