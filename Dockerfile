FROM python:3-slim

LABEL maintainer="Penn Labs"

RUN pip install pipenv 

WORKDIR /app/

COPY Pipfile* /app/

RUN pipenv install --system

COPY . /app/

USER 65534

CMD ["/usr/local/bin/python3", "authenticate.py"]
