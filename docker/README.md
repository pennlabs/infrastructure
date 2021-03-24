# Docker

This directory contains all the docker images that we maintain for our infrastructure. All of the images are built using [GitHub Actions](https://github.com/features/actions), tagged with their commit sha, and pushed to [Docker Hub](https://hub.docker.com/).

Note that we're currently in the process of moving our docker images into this repo. So the list below is not exhaustive.

We maintain the following docker images:

| Docker Image                               | Description                                                                             |
| ------------------------------------------ | --------------------------------------------------------------------------------------- |
| [Django base](django-base)                 | A base docker image for django                                                          |
| [Pg S3 Backup](pg-s3-backup)               | A docker image that bundles the aws cli and postgres used to backup our databases daily |
| [Shibboleth SP nginx](shibboleth-sp-nginx) | A docker image that contains a Shibboleth SP running behind nginx                       |
| [Team sync](team-sync)                     | A docker image to sync GitHub teams to vault policies                                   |
