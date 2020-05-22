# Chronos

Chronos is a kubernetes cluster that lives outside the lifecycle for our products. It's supposed to be configured once, then largely forgotten about (apart from occasional updates).

## backends.tf

Contains the terraform backends for each of the terraform projects (`chronos`, `vault`, and `base`). The `provider.tf` in each terraform project is configured to use the correct remote S3 backend.

## main.tf

Sets up the base Chronos cluster using our [Base Cluster Terraform Module](../modules/base_cluster). We provide custom values to traefik, vault-secret-sync, prometheus, and fluentd from files in the `helm` directory

It also creates an infrastructure postgres database using our [Postgres Cluster Terraform Module](../modules/postgres_cluster). Additionally we create grafana and vault users within the database.

## provider.tf

Configures terraform to use the `chronos` remote S3 backend as well as the following providers

* AWS
* DigitalOcean
* Helm & Kubernetes (pointing to the `chronos` cluster)
* Postgres (pointing to the infrastructure database)
* Random

## grafana.tf

Installs the [grafana helm chart](https://github.com/helm/charts/tree/master/stable/grafana) (on [grafana.pennlabs.org](https://grafana.pennlabs.org)) with

* GitHub OAuth2 authentication within the `pennlabs` organization
* Prometheus data sources for `chronos`, `sandbox`, and `production` (with basic auth for the latter two).
* The Kubernetes node exporter full dashboard
* TODO: add our custom dashboard

## team-sync.tf

Installs [team sync](github.com/pennlabs/docker-team-sync/) through helm to create vault policies for team leads based on their GitHub team within the `pennlabs` organization.

## vault.tf

Configures vault (on [vault.pennlabs.org](https://vault.pennlabs.org)) by

* Creating an AWS KMS key to [auto unseal vault](https://www.vaultproject.io/docs/configuration/seal/awskms.html)
* Creating an IAM user and policy for vault to access said KMS key
* Creating a Kubernetes secret with the IAM credentials, KMS key ID, and a connection url for the vault user in the infrastructure postgres database
* Installing the [vault helm chart](https://github.com/hashicorp/vault-helm)
* [Creating the table vault needs](https://www.vaultproject.io/docs/configuration/storage/postgresql) in the postgres database using a local-exec

## outputs.tf

Outputs Kubernetes credentials for the `chronos` cluster so that [base](../base) can use those credentials to make additional changes to the cluster.
