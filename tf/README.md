# Terraform

We use Terraform to manage our infrastructure in a declarative manner.

`provider.tf` just specifies where we want to manage infrastructure.

`main.tf` and `outputs.tf` contain the base configuration to get a Kubernetes cluster and MySQL cluster up and running on Digital Ocean.

Every other file contains configuration needed to set up the infrastructure for that software. For example `ghost.tf` creates an AWS S3 bucket, IAM user, and IAM policy as well as exports the IAM credentials for the newly created ghost user.
