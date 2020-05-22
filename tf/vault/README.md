# Vault

We use vault to store any secrets that our products (or infrastructure) need to work. This directory contains all the terraform configuration needed to set up vault.

## variables.tf

Defines the following inputs to store within vault. These variables can be provided in a [few different ways](https://www.terraform.io/docs/configuration/variables.html#assigning-values-to-root-module-variables) but environment variables appear to be the easiest

| Name                       | Description                                                                                                                                                                       |
|----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| VAULT_TOKEN                | The root vault token you just generated                                                                                                                                           |
| CF_API_KEY          | The [Global API Key](https://cert-manager.io/docs/configuration/acme/dns01/cloudflare/#api-keys) of the Penn Labs Cloudflare account                                              |
| GH_PERSONAL_TOKEN   | A [GitHub Personal Access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) of the Penn Labs Admin account |
| GF_GH_CLIENT_ID     | The Client ID to the Grafana Penn Labs OAuth2 application on Github                                                                                                               |
| GF_GH_CLIENT_SECRET | The Client Secret to the Grafana Penn Labs OAuth2 application on Github                                                                                                           |

## main.tf

Sets up the base vault configuration we need. It involves

* Enabling the [key-value secrets engine](https://www.vaultproject.io/docs/secrets/kv/kv-v2) on `secrets/`
* Enabling the [approle auth backend](https://www.vaultproject.io/docs/auth/approle) on `/approle`
* Enabling [github auth backend](https://www.vaultproject.io/docs/auth/github) on `/github`
* Creating an admin vault policy
* Mapping the SRE team on GitHub to the admin policy

## provider.tf

Configures terraform to use the `vault` remote S3 backend as well as the following providers

* Vault
* Random

## cert-manager

Saves the Cloudflare API Key in vault so that it will be synced to the `cert-manager` namespace in `chronos`, `sandbox`, and `production`.

## monitoring.tf

Configures grafana and prometheus by:

* Creating passwords to protect the prometheus ingresses in `sandbox` and `production
* Generating a correctly formatted secret within vault using bcrypt that traefik uses to enforce HTTP basic auth
* Generating a secure password for the admin grafana user in `chronos`
* Saving the above-mentioned secrets, as well as the Grafana Penn Labs OAuth2 credentials in a secret that will be synced to the `default` namespace on `chronos`

## secret-sync.tf

Configures secret sync by:

* Creating a vault policy for secret-sync (stored in `policies/secret-sync.hcl`)
* Creating an AppRole secret-sync user
* Saving the role id and secret id in secrets that will be synced to:
  * `cert-manager`, `default`, and `monitoring` in `chronos`
  * `cert-manager`, `default`, and `monitoring` in `sandbox`
  * `cert-manager`, `default`, `staging`, and `monitoring` in `production`

## team-sync.tf

Configures team sync by:

* Creating a vault policy for team-sync (stored in `policies/team-sync.hcl`)
* Creating an AppRole team-sync user
* Saving the role id and secret id in a secret that will be synced to the `default` namespace in `chronos`

## terraform-user.tf

Creates a terraform AppRole user with admin privileges

## outputs.tf

Exports the role id and secret id of the terraform AppRole vault user so that [base](../base) can use those credentials to make additional changes to vault.
