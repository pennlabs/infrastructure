# django-base

[![Docker Pulls](https://img.shields.io/docker/pulls/pennlabs/django-base)](https://hub.docker.com/r/pennlabs/django-base)

This repository contains a base docker image to use with django. To use it, create a Dockerfile like:

```Dockerfile
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

## Tags
Currently, our Penn Labs products use different image tags for django-base. The main reason is that different products are compatible with different versions of python. 

Because of this, each `django-base` is comprised of "Shared" and "Simple" tags. For each new version of `django-base` (associated with a GIT sha), a new "Shared tag" is created. The "Simple tag" is the same as the "Shared tag" but with the python version appended to the end. 

For example, the current "Shared tag" can be `a142aa6975ee293bbc8a09ef0b81998ce7063dd3` and the current "Simple tag" is `a142aa6975ee293bbc8a09ef0b81998ce7063dd3-python3.10`.

- `[sha]`: Python 3.10 (default)
- `[sha]-3.10`: Python 3.10.18 (`penn-courses`)
- `[sha]-3.9`: Python 3.9.23 (`penn-mobile`)
- `[sha]-3.8`: Python 3.8.11 (`penn-clubs`, `office-hours-queue`)

## Features

This docker image contains pipenv and necessary packages to use `mysqlclient`

## Build Args
The `django-base` image supports the build-arg `PYTHON_VERSION` which can be used to specify the python version to use. The default is `3.10`. 
