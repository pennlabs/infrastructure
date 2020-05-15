FROM python:3-slim

LABEL maintainer="Penn Labs"

RUN pip install pipenv 

WORKDIR /app/

COPY Pipfile* /app/

RUN pipenv install --system

COPY . /app/

CMD ["/usr/local/bin/python3", "authenticate.py"]
