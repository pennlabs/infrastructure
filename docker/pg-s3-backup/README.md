# Pg S3 Backup

This docker image backups up all databases in a PostgreSQL cluster to an S3 bucket.

## Usage

The following environment variables need to be defined:

* AWS_ACCESS_KEY_ID
* AWS_SECRET_ACCESS_KEY
* AWS_DEFAULT_REGION
* S3_BUCKET
* S3_PREFIX
* DATABASE_URL
