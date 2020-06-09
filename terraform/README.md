# Terraform

We use [Terraform](https://www.terraform.io/docs/index.html) to manage our infrastructure in a declarative manner.

Our terraform configuration consists of four parts:

1. Chronos - A long-lived K8s cluster that runs atlantis, grafana, and vault
2. Vault - Configuration for Vault
3. Base Configuration for our Sandbox and Production clusters
    1. Sandbox Cluster - A sandbox K8s cluster for us to test infrastructure related changes
    2. Production cluster - Our production cluster that contains our products and additional applications
4. Modules - these are different terraform modules we use to replicate configuration across our different clusters.
    1. Base Cluster - a barebones K8s cluster with additional software installed
    2. Postgres Cluster - a module to create a postgres cluster as well as users/databases with correct default permissions
    3. Vault Flush - a module to flush updated secrets to vault

Each directory contains a README with additional information about that directory.

## Bootstrapping

If you want to start from scratch (or somehow DigitalOcean loses an entire datacenter in NY. Follow these steps. **Make sure to have psql installed on whatever machine you're running these commands on.**

The very first thing you need to do is create credentials for terraform to use for AWS and DigitalOcean.

Create a `terraform` [AWS IAM user](https://console.aws.amazon.com/iam/home#/users) and attach the `AdministratorAccess` policy to it. Also create a [DigitalOcean Personal Access Token](https://cloud.digitalocean.com/account/api/tokens) for terraform.

Now export the following environment variables:
| Name                      | Description                       |
|---------------------------|-----------------------------------|
| DIGITALOCEAN_ACCESS_TOKEN | The DO Access Token for terraform |
| AWS_ACCESS_KEY_ID         | The AWS Access Key for terraform  |
| AWS_SECRET_ACCESS_KEY     | The AWS Secret Key for terraform  |

Now on to creating the actual infrastructure. First, `chronos` needs to create its own S3 bucket remote backend so that it can store its state in the cloud (and not your laptop). To create that bucket, first comment out the `terraform` block in `chronos/provider.tf` then run:

```bash
cd chronos
terraform init
terraform apply --target module.chronos_tfstate_backend
```

uncomment the `terraform` block from `chronos/provider.tf` and run:

```bash
terraform init
terraform apply
```

If you run into any issues, a second `terraform apply` usually solves them.

At this point the Chronos cluster will be deployed but vault won't yet be configured correctly. There will likely be a lot of errors in K8s due to missing secrets. Ignore those for now.

Create the following DNS records where `x.x.x.x` is the IP address of traefik (Traefik's IP can be found in the DigitalOcean Loadbalancer page)

| Type  | Name                          | Destination                 |
|-------|-------------------------------|-----------------------------|
| A     | upenn.club                    | x.x.x.x                     |
| CNAME | *.upenn.club                  | upenn.club                  |
| CNAME | vault.pennlabs.org            | upenn.club                  |
| CNAME | grafana.pennlabs.org          | upenn.club                  |
| CNAME | \_acme-challenge.pennlabs.org | \_acme-challenge.upenn.club |

Now you need to unseal vault. Download a kubeconfig for the Chronos cluster from DigitalOcean and run the following commands:

```bash
$ kubectl apply -f utils/temp-vault-ingress.yaml
$ kubectl exec -it vault-0 -- /bin/sh
vault-0 $ vault operator init -recovery-shares=1 -recovery-threshold=1
```

Save the resulting root token and key in a safe location.

Now export the following environment variables

| Name                       | Description                                                                                                                                                                       |
|----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| VAULT_TOKEN                | The root vault token you just generated                                                                                                                                           |
| TF_VAR_CF_API_KEY          | The [Global API Key](https://cert-manager.io/docs/configuration/acme/dns01/cloudflare/#api-keys) of the Penn Labs Cloudflare account                                              |
| TF_VAR_GH_PERSONAL_TOKEN   | A [GitHub Personal Access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) of the Penn Labs Admin account |
| TF_VAR_GF_GH_CLIENT_ID     | The Client ID to the Grafana Penn Labs OAuth2 application on Github                                                                                                               |
| TF_VAR_GF_GH_CLIENT_SECRET | The Client Secret to the Grafana Penn Labs OAuth2 application on Github                                                                                                           |
| TF_VAR_ELASTIC_PASSWORD    | The password to the managed elasticsearch instance                                                                                                                                |
| TF_VAR_ELASTIC_HOST        | The host to the managed elasticsearch instance (format should be https://host:port)                                                                                               |
| VAULT_ADDR                 | Set this to <https://vault.upenn.club>                                                                                                                                            |

Run the following commands:

```bash
cd ../vault
terraform init
terraform apply
```

The last step is to deploy the sandbox and production clusters. First, log into vault and create empty secrets for all of our products (named `locals.database_users` in `base/main.tf`) with the path `secrets/production/default/<product name>`. Then run the following commands

```bash
cd ../base
terraform init
terraform apply
```

Create the following DNS records where `y.y.y.y` is the IP address of traefik in the production cluster (Traefik's IP can be found in the DigitalOcean Loadbalancer page)

| Type  | Name                                    | Destination                 |
|-------|-----------------------------------------|-----------------------------|
| A     | pennlabs.org                            | y.y.y.y                     |
| CNAME | *.pennlabs.org                          | pennlabs.org                |
| CNAME | helm.pennlabs.org                       | pennlabs.github.io          |
| A     | \<all product domains>                  | y.y.y.y                     |
| CNAME | \_acme-challenge.\<all product domains> | \_acme-challenge.upenn.club |

Now you can run the following command to delete the temporary vault ingress.

```bash
kubectl delete -f ../chronos/utils/temp-vault-ingress.yaml
```

If all goes well, you should now have 3 working clusters completely managed through terraform.

The final configuration for the new clusters consists of editing the `k8s-deploy` context in CircleCI and replacing `K8S_CLUSTER_ID` with the cluster ID of your new production cluster which can be found in DigitalOcean.

## Things we would like to improve

* We currently use bcrypt to generate the secret traefik uses to provide authentication for our prometheus ingresses. Unfortunately the output of the bcrypt function changes each time it's called, which causes `terraform apply` to change the secret data each time the command is run.
* Grafana metadata is stored in a pvc, so it cannot be transferred cluster-to-cluster. We would love to move to postgres, but the helm chart doesn't support it.
* In `base` we need to manually create the secret-sync authentication secrets in Kubernetes in each ns of each cluster. There's doesn't seem to be an immediate cleaner way of doing this, but it feels like there should be.
* From some reason vault appears to change its own permissions for the `vault` database, which results in `terraform apply` readding the "ALL" privilege each time it's run. This doesn't break anything, but is weird behavior.
