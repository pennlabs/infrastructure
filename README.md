## Steps to spin up cluster:

First, you must install helm, kubectl, terraform, gettext (for envsubst).

### Run Terraform configuration

Make sure to first create a personal access token for your cluster here:

https://cloud.digitalocean.com/account/api/tokens

``` bash
$ cd tf
$ export DIGITALOCEAN_ACCESS_TOKEN=<your_do_token>
$ export AWS_ACCESS_KEY_ID=<your_aws_access_key>
$ export AWS_SECRET_ACCESS_KEY=<your_aws_secret_key>
$ export AWS_DEFAULT_REGION="us-east-1"
$ terraform init
$ terraform plan
$ terraform apply
```

Now, initialize the cluster:

```bash
$ ./init_cluster.sh
```

### Set up Vault

```bash
$ k exec -it vault-0 -- /bin/sh
$ vault operator init -recovery-shares=1 -recovery-threshold=1
# Save the generated token in case you need to recover later
$ vault login
$ vault auth enable github
$ vault write auth/github/config organization=pennlabs
$ vault write auth/github/map/teams/Platform value=admin
$ cd
$ cat <<EOF > admin-policy.hcl
# Manage auth methods broadly across Vault
path "auth/*"
{
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# Create, update, and delete auth methods
path "sys/auth/*"
{
  capabilities = ["create", "update", "delete", "sudo"]
}

# List auth methods
path "sys/auth"
{
  capabilities = ["read"]
}

# List existing policies
path "sys/policies/acl"
{
  capabilities = ["list"]
}

# Create and manage ACL policies
path "sys/policies/acl/*"
{
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# List, create, update, and delete key/value secrets
path "secret/*"
{
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# Manage secret engines
path "sys/mounts/*"
{
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# List existing secret engines.
path "sys/mounts"
{
  capabilities = ["read"]
}

# Read health checks
path "sys/health"
{
  capabilities = ["read", "sudo"]
}

# Read health checks
path "secrets/*"
{
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}
EOF
$ vault policy write admin admin-policy.hcl
```

enabling k8s auth:

```bash
$ vault auth enable kubernetes
$ vault write auth/kubernetes/config \
  kubernetes_host=https://kubernetes \
  kubernetes_ca_cert=@/var/run/secrets/kubernetes.io/serviceaccount/ca.crt
$ vault write auth/kubernetes/role/secret-reader \
    bound_service_account_names=vault-auth \
    bound_service_account_namespaces='*' \
    policies=read-secrets \
    ttl=1h
$ cat <<EOF > read-secrets.hcl
# Read health checks
path "secrets/*"
{
  capabilities = ["list", "read"]
}

# List existing secret engines.
path "sys/mounts"
{
  capabilities = ["read"]
}

# Manage secret engines
path "sys/mounts/*"
{
  capabilities = ["list", "read"]
}
EOF
$ vault policy write read-secrets read-secrets.hcl
```
