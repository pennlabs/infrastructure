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
$ terraform plan
$ terraform init
$ terraform plan
$ terraform apply
```

Now, initialize the cluster:

```bash
$ ./init_cluster.sh
```
