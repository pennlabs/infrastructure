## Steps to spin up cluster:

First, you must install helm, kubectl, terraform, gettext (for envsubst).

### Run Terraform configuration

Make sure to first create a personal access token for your cluster here:

https://cloud.digitalocean.com/account/api/tokens

``` bash
$ cd tf
$ terraform init
$ terraform plan
$ terraform apply
```

After the apply is done, it will spit out a cluster ID and database ID. Save these. Now, to get credentials, run:

```bash
$ cd ..
$ export DIGITALOCEAN_ACCESS_TOKEN=<your_token_here>
$ ./get_creds.sh <k8s_cluster_id> <db_id>
```

Your credentials will now be present in `./kubeconfig.yaml` and `./db_creds.json`. Make sure these were populated for sanity.

Now, initialize the cluster:

```bash
$ ./init.sh
```
