# Docker

This directory (will) contain all the docker images that we maintain for our infrastructure. All of the images are built using [GitHub Actions](https://github.com/features/actions), tagged with their commit sha, and pushed to [Docker Hub](https://hub.docker.com/).

We maintain the following docker images:

| Docker Image                                               | Description                                                                             |
|------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| [Django base](django-base)                                 | A base docker image for django                                                          |
| [Helm tools](helm-tools)                                   | A docker image that contains various helm tools                                         |
| [Pg S3 Backup](pg-s3-backup)                               | A docker image that bundles the aws cli and postgres used to backup our databases daily |
| [Shibboleth SP nginx](shibboleth-sp-nginx)                 | A docker image that contains a Shibboleth SP running behind nginx                       |
| [Team sync](team-sync)                                     | A docker image to sync GitHub teams to vault policies                                   |
| [Tox](tox)                                                 | A docker image that contains tox and an ssh client                                      |
| [Vault Approle Authenticator](vault-approle-authenticator) | A docker image that authenticates to vault with AppRole credentials                     |
