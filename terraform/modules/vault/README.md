# Vault

We use vault to store any secrets that our products (or infrastructure) need to work. This directory contains all the terraform configuration needed to set up vault.

## variables.tf

Defines the following inputs to store within vault. These variables can be provided in a [few different ways](https://www.terraform.io/docs/configuration/variables.html#assigning-values-to-root-module-variables) but environment variables appear to be the easiest

|                     | Description                                                                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CF_API_KEY          | The [Global API Key](https://cert-manager.io/docs/configuration/acme/dns01/cloudflare/#api-keys) of the Penn Labs Cloudflare account                                              |
| GH_PERSONAL_TOKEN   | A [GitHub Personal Access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) of the Penn Labs Admin account |
| GF_GH_CLIENT_ID     | The Client ID to the Grafana Penn Labs OAuth2 application on Github                                                                                                               |
| GF_SLACK_URL        | Slack notification URL used for Grafana notifications                                                                                                                             |
| GF_GH_CLIENT_SECRET | The Client Secret to the Grafana Penn Labs OAuth2 application on Github                                                                                                           |
| SECRET_SYNC_ARN     | ARN of the secret-sync role                                                                                                                                                       |
| TEAM_SYNC_ARN       | ARN of the team-sync role                                                                                                                                                         |

## main.tf
Sets up the base vault configuration we need. It involves

* Enabling the [key-value secrets engine](https://www.vaultproject.io/docs/secrets/kv/kv-v2) on `secrets/`
* Enabling the [aws auth backend](https://www.vaultproject.io/docs/auth/aws) on `/aws`
* Enabling [github auth backend](https://www.vaultproject.io/docs/auth/github) on `/github`
* Creating an admin vault policy
* Mapping the SRE team on GitHub to the admin policy

## cert-manager

Saves the Cloudflare API Key in vault so that it will be synced to the `cert-manager` namespace in `sandbox`, and `production`.

## grafana.tf

Configures grafana by:

* Generating a secure password for the admin grafana user in `production`
* Saving the above-mentioned password, as well as the Grafana Penn Labs OAuth2 credentials in a secret that will be synced to the `default` namespace on `production`

## secret-sync.tf

Configures secret sync by:

* Creating a vault policy for secret-sync (stored in `policies/secret-sync.hcl`)
* Mapping the secret-sync IAM role to that policy

## team-sync.tf

Configures team sync by:

* Creating a vault policy for team-sync (stored in `policies/team-sync.hcl`)
* Mapping the team-sync IAM role to that policy
* Saving a GitHub token in a secret that will be synced to the `default` namespace in `production`

## outputs.tf

Exports the secrets engine path so that vault resources outside this module can depend on this module being configured.
