# Vault AppRole Authenticator

[![CircleCI](https://circleci.com/gh/pennlabs/vault-approle-authenticator.svg?style=shield)](https://circleci.com/gh/pennlabs/vault-approle-authenticator)
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
