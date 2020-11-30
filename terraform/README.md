# Terraform

comment s3 in terraform

``` bash
cd chronos
terraform init
terraform apply --target module.tfstate_backend
```

uncomment the `terraform` block from `provider.tf` and run:

``` bash
terraform init
terraform apply
```

If you run into any issues, a second `terraform apply` usually solves them.

## Transition plan

* Create kubectl role and make sure we can assume access
* Get secret syncing working in eks (vault aws policy + docker image changes)
* Get team sync working in eks (modify docker image)
* Modify helm deploy to use gh-action iam user and get kubeconfig that way
* Push rds credentials to vault
* Disable secret-sync in current clusters
* Push updated helm deloy orb to product repos (will deploy to eks)
* transition domain name DNS
* remove extra vault stuff (chronos, sandbox, prometheus basic auth)
* Down the line
  + Transition to IAM for django db auth
