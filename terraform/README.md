# Terraform

We use [Terraform](https://www.terraform.io/docs/index.html) to manage our infrastructure in a declarative manner.

## Inputs

|                     | Description                                                                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CF_API_KEY          | The [Global API Key](https://cert-manager.io/docs/configuration/acme/dns01/cloudflare/#api-keys) of the Penn Labs Cloudflare account                                              |
| GH_PERSONAL_TOKEN   | A [GitHub Personal Access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) of the Penn Labs Admin account |
| GF_GH_CLIENT_ID     | The Client ID to the Grafana Penn Labs OAuth2 application on Github                                                                                                               |
| GF_SLACK_URL        | Slack notification URL used for Grafana notifications                                                                                                                             |
| GF_GH_CLIENT_SECRET | The Client Secret to the Grafana Penn Labs OAuth2 application on Github                                                                                                           |

## backend.tf

Contains configuration to create a terraform S3 backend. `provider.tf` in is configured to use the remote S3 backend.

## bastion.tf

Configures a bastion that allows Team Leads to exec into pods (normally to run manage.py commands).

## db-backup.tf

Grants the `db-backup` IAM role access to the `sql.pennlabs.org` S3 bucket.

## eks.tf

Creates an EKS cluster using the [EKS Module](https://registry.terraform.io/modules/terraform-aws-modules/eks/aws/latest).

Additionally installs [`aws-node-termination-handler`](https://github.com/aws/aws-node-termination-handler) and creates a `kubectl` IAM role that has admin access to the EKS cluster.

Finally, a populated kubeconfig is pushed to vault for platform members to use. However, that kubeconfig requires the user to have authorization to assume the `kubectl` role.

## gh-actions.tf

Creates an IAM user for GitHub Actions that can assume the `kubectl` IAM role as well as describe the EKS cluster (so that it can generate its own kubeconfig).

## iam.tf

Uses our [IAM Module](./modules/iam) to create IAM roles for all of our products that can be assumed by the correct Service Account in the `default` namespace.

Additionally creates an IAM role for secret sync that can be assumed from the `default`, `staging`, and `cert-manager` namespaces.

## main.tf

Defines a few locals that are used in various places:

* `database_users` - a set of all databases to be created.
* `products` - a set of all Penn Labs products in the cluster.
* `iam_service_accounts` - a set of all IAM roles that should be created with the ability to assume those roles from a Service Account.
* `platform_members` - a set of platform members to grant kubectl access to.
* `k8s_cluster_name` - the name of the EKS cluster.
* `k8s_cluster_size` - the size of our cluster.
* `domains` - a set of all our product domains.
* `traefik_lb_name` - Name of the load balancer created by traefik.
* `vault_ami` - The AMI of the official vault AMI.

## platform.tf

Creates an IAM user for certain platform members that allows them to assume the `kubectl` role (and therefore gain kubectl access to the cluster).

Additionally pushes credentials for those users into vault (where only platform members can read them).

## production-cluster.tf

Uses our [Base Cluster Module](./modules/base_cluster) to configure our K8s cluster.

Additionally also installs `team-sync`, `grafana`, `bitwarden`, and `db-backup`.

## provider.tf

Configures terraform to use the remote S3 backend as well as the following providers:

* AWS
* DigitalOcean
* Helm & Kubernetes (pointing to the EKS cluster)
* Postgres (pointing to the production database)
* Random
* Vault
* Time

## rds.tf

Creates an RDS postgres cluster with a random master password.

Additionally creates databases, database roles, and manages database grants for each product.

## route53.tf

Uses our [Domain Module](./modules/domain) to create Route53 hosted zones for all of our products that contain the minimal DNS entries we need configured.

## vault.tf

Creates a TLS certificate (provisioned by AWS) and a KMS key to use for vault.

Creates an IAM role for vault that allows it to read any IAM role (used for aws auth method) as well as interact with the KMS key generated.

Creates an EC2 instance running the official vault AMI (with a custom config file). As well as a loadbalancer that terminates TLS and points back to the EC2 instance.

Finally, configured vault using our [Vault Module](./modules/vault) as well as populate a few additional secrets.

## vpc.tf

Creates a VPC to put all of our cloud resources in using the [VPC Module](https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws/latest).
