# Bootstrapping

If you want to start from scratch (or somehow AWS loses an entire datacenter in NY). Follow these steps. **Make sure to have psql installed on whatever machine you're running these commands on.**

The very first thing you need to do is create credentials for terraform to use for AWS.

Create a `terraform` [AWS IAM user](https://console.aws.amazon.com/iam/home#/users) and attach the `AdministratorAccess` policy to it.

Now export the following environment variables:
| Name                  | Description                      |
| --------------------- | -------------------------------- |
| AWS_ACCESS_KEY_ID     | The AWS Access Key for terraform |
| AWS_SECRET_ACCESS_KEY | The AWS Secret Key for terraform |

Also export all the environment variables as specified under [Inputs](./README.md#inputs).

Now on to creating the actual infrastructure. First, we need to create an S3 bucket remote backend so that terraform can store its state in the cloud (and not your laptop). To create that bucket, first comment out the `terraform` block in `provider.tf` as well as everything specified in `vault.tf` then run:

``` bash
terraform init
terraform apply --target module.tfstate_backend
```

You will probably need to manually create the verification DNS record for vault and rerun `terraform apply`.

Now export the following environment variable (keeping the previous exported variables):
| Name        | Description                             |
| ----------- | --------------------------------------- |
| VAULT_TOKEN | The root vault token you just generated |

uncomment the `terraform` block from `provider.tf` and run:

``` bash
terraform init
terraform apply
```

If you run into any issues, a second `terraform apply` usually solves them.

Create the following DNS records where `xyz.us-east-1.elb.amazonaws.com` is the Elastic Loadbalancer DNS name of vault (Which can be found in the AWS management console).

| Type  | Name                          | Destination                     |
| ----- | ----------------------------- | ------------------------------- |
| CNAME | vault.pennlabs.org            | xyz.us-east-1.elb.amazonaws.com |
| CNAME | \_acme-challenge.pennlabs.org | \_acme-challenge.upenn.club     |

Next, visit [vault](https://vault.pennlabs.org) and follow the prompts to initialize vault. Save the root token and recovery key in a safe location.

Then, uncomment everything in `vault.tf` and run:

``` bash
terraform init
terraform apply
```

Finally, create the following DNS records where `y.y.y.y` is the IP address of traefik in the production cluster (Traefik's IP can be found in the AWS management console).

| Type  | Name                                    | Destination                 |
| ----- | --------------------------------------- | --------------------------- |
| A     | pennlabs.org                            | y.y.y.y                     |
| CNAME | *.pennlabs.org                          | pennlabs.org                |
| A     | \<all product domains>                  | y.y.y.y                     |
| CNAME | \_acme-challenge.\<all product domains> | \_acme-challenge.upenn.club |

If all goes well you should have a fully fuctional Kubernetes cluster with everything you need configured.
