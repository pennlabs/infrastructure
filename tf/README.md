# Terraform

We use Terraform to manage our infrastructure in a declarative manner.

`provider.tf` just specifies where we want to manage infrastructure.

`main.tf` and `outputs.tf` contain the base configuration to get a Kubernetes cluster and MySQL cluster up and running on Digital Ocean.

Every other file contains configuration needed to set up the infrastructure for that software. For example `ghost.tf` creates an AWS S3 bucket, IAM user, and IAM policy as well as exports the IAM credentials for the newly created ghost user.

# Design

## Modules

### Base Infra

This will create a base Labs infrastructure setup with the below modules.

### Database

We will have one module to create a prod mysql database cluster. This will create a cluster on our specified number of nodes on a standardized version.

We will have another module using the mysql provider to create a database + user scoped to only that database.

### K8s Cluster

This module will create a kubernetes cluster with a specified number of nodes.

### S3 Bucket

This module will create an s3 bucket and an associated AWS user locked to that bucket with IAM.
