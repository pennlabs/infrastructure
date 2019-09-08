# django-base

This repository contains a base docker image to use with django. To use it, create a Dockerfile like:

```
From pennlabs/django-base
```

# Features
This docker image contains pipenv and necessary packages to use `mysqlclient`

The Dockerfile contains `ONBUILD` instructions so almost no commands need to be added to the product Dockerfile.
