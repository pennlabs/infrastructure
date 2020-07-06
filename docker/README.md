# Docker

This directory (will) contain all the docker images that we maintain for our infrastructure. All of the images are built using [GitHub Actions](https://github.com/features/actions), tagged with their commit sha, and pushed to [Docker Hub](https://hub.docker.com/).

Note that we're currently in the process of moving our docker images into this repo. So the list below is not exhaustive.

We maintain the following docker images:

* [Pg-S3-Backup](pg-s3-backup) - a docker image that bundles the aws cli and postgres used to backup our databases daily
