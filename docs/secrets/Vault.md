# Vault
[Vault](https://www.vaultproject.io/) is a secret manager provided by HashiCorp. We use the open-source version of Vault at Labs. Typically, there are two ways to configure Vault. You can either use a *library* to retrieve the secret data, or create a *side car* to extract your secrets and feed them into the application. We uses the latter method.

## Where is Vault hosted?
We host Vault at [vault.pennlabs.org](https://vault.pennlabs.org). This is done by terraform, with Vault's configuration specified [here](https://github.com/pennlabs/infrastructure/blob/master/terraform/vault.tf).

## What is Vault hosting?
### Values in Vault
Secrets in Vault are scoped by their paths.

- [*Cubbyhole*](https://www.vaultproject.io/docs/secrets/cubbyhole
): Currently, our cubbyhole has nothing inside it, but it's enabled by default.
- [*KV*](https://www.vaultproject.io/docs/secrets/kv/kv-v2): Key Value storage under path `secrets/`.

## How to update Vault secrets?
Secrets in Vault can be updated by:
1. Updating the terraform files: `vault.tf` (database secrets)
2. Editing Vault directly at [vault.pennlabs.org](https://vault.pennlabs.org)

Also, Vault allow for *versioned secrets*, which is a pretty neato way to say that you can view & revert them back to previous versions via the Vault UI.

## Terraform Modules
### [Vault module](../../terraform/modules/vault)
Configures Vault itself. 

An example configuration includes updating [Vault policies](../../terraform/modules/vault/policies). Adding a new policy requires:
1. Add a new policy file to the [Vault policies](../../terraform/modules/vault/policies) folder. See `admin.hcl` for exmaple.
2. Modify vault terraform files to include the new policy by declaring a new [`resource "vault_policy"`](../../terraform/modules/vault/main.tf#L21-L27) block.
3. Apply your changes.

### [Vault Flush module](../../terraform/modules/vault_flush)
This module allows you to create/update vault secrets by specifying a path to the secret and the new/updated value.