# Base Cluster

A terraform module to create a Kubernetes cluster on DigitalOcean with some additional software installed.

## Inputs

| Name                     | Description                                                   |
|--------------------------|---------------------------------------------------------------|
| name                     | Name of the Kuberenetes cluster                               |
| cluster_version          | Kubernetes version of the cluster (Default: 1.17.5-do.0)      |
| node_count               | Number of nodes in cluster                                    |
| node_size                | DigitalOcean size for Kubernetes nodes (Default: s-2vcpu-4gb) |
| traefik_values           | Values to provide to the traefik helm chart                   |
| cert_manager_values      | Values to provide to the Cert Manager helm chart              |
| vault_secret_sync_values | Values to provide to the Vault Secret Sync helm chart         |
| prometheus_values        | Values to provide to the Prometheus helm chart                |
| fluentd_values           | Values to provide to the Fluentd helm chart                   |

## Outputs

| Name                   | Description                           |
|------------------------|---------------------------------------|
| endpoint               | Endpoint of the created cluster       |
| token                  | Token to access the created cluster   |
| cluster_ca_certificate | CA Certificate of the created cluster |

## main.tf

Creates the actual Kubernetes cluster in DigitalOcean

## cert-manager.tf

Configures cert-manager by

* Creating the `cert-manager` namespace
* Installing the `cert-manager` helm chart to the `cert-manager` namespace
* Creating a [ClusterIssuer](https://cert-manager.io/docs/concepts/issuer/) to issue TLS certificates from [Lets Encrypt](https://letsencrypt.org/) using the DNS01 challenge with [delegated domains](https://cert-manager.io/docs/configuration/acme/dns01/#delegated-domains-for-dns01) through our Cloudflare account.
* Creating a wildcard certificate for `*.pennlabs.org` in the `default` namespace

## monitoring.tf

Configure our monitoring stack by

* Creating the `monitoring` namespace
* Installing the [prometheus helm chart](https://github.com/helm/charts/tree/master/stable/prometheus) with the inputted values
* Installing [fluentd-elasticsearch helm chart](https://github.com/kiwigrid/helm-charts/tree/master/charts/fluentd-elasticsearch) with the inputted values

## traefik.tf

Installs the [traefik 1.7 helm chart](https://github.com/helm/charts/tree/master/stable/traefik) with the inputted values

## vault-secret-sync.tf

Installs the [vault secret sync helm chart](https://github.com/pennlabs/vault-secret-sync/) with the inputted values
