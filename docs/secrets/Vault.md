# Vault
[Vault](https://www.vaultproject.io/) is a secret manager provided by HashiCorp. We use the open-source version of Vault at Labs.

Typically, there are two ways to configure Vault. You can either use a *library* to retrieve the secret data, or create a *side car* to extract your secrets and feed them into the application.

We uses the latter method.

## Where is vault hosted?
We host vault at [vault.pennlabs.org](https://vault.pennlabs.org). This is done by terraform, with vault's configuration specified [here](https://github.com/pennlabs/infrastructure/blob/master/terraform/vault.tf).

## What is vault hosting?
### Values in Vault
Secrets in Vault are scoped by their paths.

*Cubbyhole* ([Relevant Documentation](https://www.vaultproject.io/docs/secrets/cubbyhole
)): Currently, our cubbyhole has nothing inside it, but it's enabled by default.

*KV*([Relevant Documentation](https://www.vaultproject.io/docs/secrets/kv/kv-v2
)): Key Value storage under path `secrets/`.

## How to update vault secrets?
Secrets in vault can be updated by:
1. Updating the terraform files: `vault.tf` (database secrets)
2. Editing vault directly at [vault.pennlabs.org](https://vault.pennlabs.org)

Also, vault allow for *versioned secrets*, which is a pretty neato way to say that you can view & revert them back to previous versions via the Vault UI.

## Terraform Modules
### [Vault module](https://github.com/pennlabs/infrastructure/tree/master/terraform/modules/vault)
Configures vault itself.

### [Vault Flush module](https://github.com/pennlabs/infrastructure/tree/master/terraform/modules/vault_flush)

This module allows you to create/update vault secrets by specifying a path to the secret and the new/updated value.