# Terraform

We use Terraform to manage our infrastructure in a declarative manner.

`provider.tf` just specifies where we want to manage infrastructure.

`main.tf` and `outputs.tf` contain the base configuration to get a Kubernetes cluster and MySQL cluster up and running on Digital Ocean.

Every other file contains configuration needed to set up the infrastructure for that software. For example `ghost.tf` creates an AWS S3 bucket, IAM user, and IAM policy as well as exports the IAM credentials for the newly created ghost user.

## Bootstrapping

When starting from scratch, `base` needs to create its own S3 bucket remote backend. To create that bucket, first comment out the `terraform` block in `base/provider.tf` then run:

```bash
cd base
terraform init
terraform apply --target module.terraform_state_backend
```

uncomment the `terraform` block from `base/provider.tf` and run:

```bash
terraform init
terraform apply
```

## Design

### Modules

#### Base Infra

This will create a base Labs infrastructure setup using the below modules.

#### Database Cluster

This module will create a mysql database cluster with a specified number of nodes on a standardized version. This module will also create a database + user scoped to only that database. This module will also optionally flush credentials to vault.

#### K8s Cluster

This module will create a kubernetes cluster with a specified number of nodes and our base configuration.

#### S3 Bucket

This module will create an s3 bucket and an associated AWS user locked to that bucket with IAM.

#### IAM User

This module will create an IAM user with a username and password and with a policy that allows it to access specified S3 buckets.
