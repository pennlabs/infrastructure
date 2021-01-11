# IAM

A terraform module to create an IAM role that can be assumed by a Kubernetes Service Account with the same name.

## Inputs

| Name              | Description                             |
| ----------------- | --------------------------------------- |
| role              | Name of K8s SA (and generated IAM role) |
| namespaces        | Namespaces of the K8s SA                |
| oidc_issuer_url   | URL of the K8s oidc issuer              |
| oidc_provider_arn | PoARN of the K8s oidc issuer            |

## Outputs

None
