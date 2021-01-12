# Vault Flush

A terraform module to flush updated secrets to vault. It takes in an existing secret as well as a map of keys and values to update or create and updates the secret in vault.

## Inputs

| Name  | Description                          |
| ----- | ------------------------------------ |
| path  | Path to the existing secret in Vault |
| entry | Entries to replace within the secret |

Note that a secret must already exist at `path` for this module to work.

## Outputs

None
