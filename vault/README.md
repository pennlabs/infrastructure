# Vault

Vault is the secret store we use. We use a CronJob to sync secrets from the vault path `secrets/data` into the cluster's default namespace. Our Vault instance uses a MySQL database as its storage backend, and credentials are provided via env variables and `envsubst` when `init_cluster.sh` is called. For detail on how this works, see `init.sh`. The MySQL DB is encrypted using a key that is created and stored in AWS KMS.
