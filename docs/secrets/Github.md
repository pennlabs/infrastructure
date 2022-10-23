# Github 
Most of our secrets are stored as Github Organization Secrets. 

## How to add Github secrets
Most Github org secrets are added manually, although some are specified via terraform resources in [github.tf](https://github.com/pennlabs/infrastructure/blob/master/terraform/github.tf) file. 

Terraform knows what the value of these secrets are by referencing data/resources that do have access to knowing these values. For example, finding the AWS access key using `data.aws_caller_identity.current.account_id`.

> For our private repositories (e.g. ocwp), it is not possible to access Github Org Secrets with the free tier. Thus, these repos typically have some org secrets copied over to the repository level ([relevant PR](https://github.com/pennlabs/infrastructure/pull/154)).

By doing `terraform apply`, the secrets are created on Github.



