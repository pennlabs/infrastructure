import os

import hvac


def sync():
    client = hvac.Client(
        url=os.environ.get("VAULT_ADDR"), verify=False
    )  # TODO: disable verify=false
    client.auth_approle(os.environ.get("ROLE_ID"), os.environ.get("SECRET_ID"))
    if not client.sys.is_sealed():
        with open(os.environ.get("VAULT_TOKEN_PATH"), "w") as f:
            f.write(client.token)
    else:
        print("Vault is sealed")
        exit(1)


if __name__ == "__main__":
    sync()
