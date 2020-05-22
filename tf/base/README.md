# Base

This directory mainly contains configuration for our production and sandbox Kubernetes clusters as well as configuration for our production postgres database. It also contains a small amount of configuration for our chronos cluster.

## main.tf

Sets up the base Sandbox and Production clusters using our [Base Cluster Terraform Module](../modules/base_cluster). We provide custom values to traefik, vault-secret-sync, prometheus, and fluentd from files in the `helm-sandbox` and `helm-production` directories.

It also creates a production postgres database using our [Postgres Cluster Terraform Module](../modules/postgres_cluster). Additionally we create users for bitwarden, and all of our products within the database.

## provider.tf

Configures terraform to use the `base` remote S3 backend as well as the following providers

* AWS
* DigitalOcean
* Helm & Kubernetes (pointing to the `production` cluster)
* Helm & Kubernetes with the `sandbox` alias (pointing to the `sandbox` cluster)
* Helm & Kubernetes with the `chronos` alias pointing to the `chronos` cluster)
* Postgres (pointing to the production database)
* Random
* Vault

Also configures [terraform remote state](https://www.terraform.io/docs/providers/terraform/d/remote_state.html) for `chronos` and `vault` to gain access to credentials generated from those terraform projects.

## bitwarden.tf

Installs [bitwarden_rs](https://github.com/dani-garcia/bitwarden_rs) through [Icarus](https://github.com/pennlabs/icarus) on to our production cluster.

## ghost.tf

Installs [ghost](https://ghost.org/) through [Icarus](https://github.com/pennlabs/icarus) on to our production cluster.

## secret-sync.tf

Saves the secret-sync AppRole credentials in Kubernetes secrets in:

* `cert-manager`, `default`, and `monitoring` namespaces in `chronos`
* `cert-manager`, `default`, and `monitoring` namespaces in `sandbox`
* `cert-manager`, `default`, `staging`, and `monitoring` namespaces in `production`

## vault-flush.tf

Saves the database credentials for all of our products in vault.
