# Vault AppRole Authenticator

![Publish vault-approle-authenticator](https://github.com/pennlabs/infrastructure/workflows/Publish%20vault-approle-authenticator/badge.svg)
[![Docker Pulls](https://img.shields.io/docker/pulls/pennlabs/vault-approle-authenticator)](https://hub.docker.com/r/pennlabs/vault-approle-authenticator)

This docker image authenticates with an instance of vault using the AppRole authentication method and writes the resulting token to a file.

The following environment variables need to be provided:
| Variable         | Description                                         |
|------------------|-----------------------------------------------------|
| VAULT_ADDR       | The address of the vault instance                   |
| ROLE_ID          | The AppRole role id                                 |
| SECRET_ID        | The AppRole secret id                               |
| VAULT_TOKEN_PATH | Path to the file to store the resulting vault token |

We use this image within our [Vault Secret Sync helm chart](https://github.com/pennlabs/vault-secret-sync).
