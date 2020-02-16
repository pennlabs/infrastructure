## Steps to spin up cluster:

First, you must install helm, kubectl, terraform, gettext (for envsubst).

### Run Terraform configuration

Make sure to first create a personal access token for your cluster here:

https://cloud.digitalocean.com/account/api/tokens

``` bash
$ cd tf/s3
$ export DIGITALOCEAN_ACCESS_TOKEN=<your_do_token>
$ export AWS_ACCESS_KEY_ID=<your_aws_access_key>
$ export AWS_SECRET_ACCESS_KEY=<your_aws_secret_key>
$ export AWS_DEFAULT_REGION="us-east-1"
$ terraform init
$ terraform import aws_s3_bucket.terraform_state labs-tfstate
$ terraform plan
$ terraform apply
$ cd ..
$ terraform init
$ terraform plan
$ terraform apply
$ terraform output -json > tf_creds.json
$ cd ..
```

Now, initialize the cluster:

```bash
$ ./init_cluster.sh
```

### Set up Vault

```bash
$ kubectl exec -it vault-0 -- /bin/sh
vault-0 $ vault operator init -recovery-shares=1 -recovery-threshold=1
# Save the generated token in case you need to recover later
vault-0 $ vault login
# Enable github auth
vault-0 $ vault auth enable github
vault-0 $ vault write auth/github/config organization=pennlabs
vault-0 $ vault write auth/github/map/teams/Platform value=admin
vault-0 $ cd
# Enable kubernetes auth
vault-0 $ vault auth enable kubernetes
vault-0 $ vault write auth/kubernetes/config \
  kubernetes_host=https://kubernetes \
  kubernetes_ca_cert=@/var/run/secrets/kubernetes.io/serviceaccount/ca.crt
vault-0 $ vault write auth/kubernetes/role/secret-reader \
  bound_service_account_names=vault-auth \
  bound_service_account_namespaces='*' \
  policies=read-secrets \
  ttl=1h
vault-0 $ $ vault write auth/kubernetes/role/team-auth \
  bound_service_account_names=team-auth \
  bound_service_account_namespaces='*' \
  policies=sre \
  ttl=1h
vault-0 $ cat <<EOF > read-secrets.hcl
// paste in secret reader policy here
// https://raw.githubusercontent.com/pennlabs/infrastructure/master/vault/read-secrets.hcl
EOF
vault-0 $ vault policy write read-secrets read-secrets.hcl
```

### Add Github Token

To automate team syncing from Github to Vault, we've written a team syncing cronjob. It needs one secret, `GITHUB_TOKEN`, a Github personal access token with only one scope: `read:org`. Add this secret under `secrets/data/team-sync`, and it'll populate in due time.

### Configure additional components

See the following READMEs for info on setup

- [Ghost](/ghost/README.md)
- [Bitwarden](/bitwarden/README.md)
- [Monitoring](/monitoring/README.md)
- [PHPMyAdmin](/phpmyadmin/README.md)
