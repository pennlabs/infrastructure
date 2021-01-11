# Base Cluster

A terraform module to create a Kubernetes cluster on DigitalOcean with some additional software installed.

## Inputs

| Name                     | Description                                           |
| ------------------------ | ----------------------------------------------------- |
| traefik_values           | Values to provide to the traefik helm chart           |
| cert_manager_values      | Values to provide to the Cert Manager helm chart      |
| vault_secret_sync_values | Values to provide to the Vault Secret Sync helm chart |
| prometheus_values        | Values to provide to the Prometheus helm chart        |

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

## traefik.tf

Installs the [traefik 1.7 helm chart](https://github.com/helm/charts/tree/master/stable/traefik) with the inputted values

## vault-secret-sync.tf

Installs the [vault secret sync helm chart](https://github.com/pennlabs/vault-secret-sync/) with the inputted values
