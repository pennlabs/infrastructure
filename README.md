# django-base

This repository contains a base docker image to use with django. To use it, create a Dockerfile like:

```
From pennlabs/django-base

# Copy project dependencies
COPY Pipfile* /app/

# Install project dependencies
RUN pipenv install --system

# Copy project files
COPY . /app/

# Collect static files
RUN python3.7 /app/manage.py collectstatic --noinput
```

# Features
This docker image contains pipenv and necessary packages to use `mysqlclient`
