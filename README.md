# Infrastructure

In this repo, you can find all the configs for Penn Labs' infrastructure. Information on how to create a cluster from scratch are in [Bootstrapping](/BOOTSTRAPPING.md).

## Guide

| Directory  | Purpose                                          |
|------------|--------------------------------------------------|
| bitwarden  | K8s configs to set up bitwarden_rs               |
| docker     | Infrastructure-specific Dockerfiles              |
| consul     | K8s configs to set up consul cluster to serve as traefik's data store  |
| ghost      | Helm configs to set up Ghost CMS for blogging    |
| monitoring | K8s configs needed to set up Prometheus, Grafana |
| tf         | Terraform configs for all infrastructure         |
| traefik    | K8s configs needed to set up traefik             |
| vault      | K8s configs needed to set up vault               |

## Things that are bad

There are some things about this infrastructure that, while being fine for normal use, could use improvement:

- Grafana metadata is stored in a pvc, so it cannot be transferred cluster-to-cluster. Would love to move to mysql, but the helm chart doesn't support it.
