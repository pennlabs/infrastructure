# Pg S3 Backup

![Publish pg-s3-backup](https://github.com/pennlabs/infrastructure/workflows/Publish%20pg-s3-backup/badge.svg)
[![Docker Pulls](https://img.shields.io/docker/pulls/pennlabs/pg-s3-backup)](https://hub.docker.com/r/pennlabs/pg-s3-backup)

This docker image backups up all databases in a PostgreSQL cluster to an S3 bucket.

## Usage

The following environment variables need to be defined:

* AWS_ACCESS_KEY_ID
* AWS_SECRET_ACCESS_KEY
* AWS_DEFAULT_REGION
* S3_BUCKET
* S3_PREFIX
* DATABASE_URL
