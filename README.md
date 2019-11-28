# Infrastructure

In this repo, you can find all the configs for Pennlabs' infrastructure. Information on how to create a cluster from scratch are in [Bootstrapping](/BOOTSTRAPPING.md).

## Guide

| Directory  | Purpose                                          |
|------------|--------------------------------------------------|
| docker     | Infrastructure-specific Dockerfiles              |
| etcd       | K8s configs to set up etcd cluster               |
| monitoring | K8s configs needed to set up Prometheus, Grafana |
| tf         | Terraform configs for all infrastructure         |
| traefik    | K8s configs needed to set up traefik             |
| vault      | K8s configs needed to set up vault               |

## Things that are bad

There are some things about this infrastructure that, while being fine for normal use, could use improvement:

- When the traefik daemonset gets created, it sometimes goes into crashloopbackoff because there are 5 traefik instances trying to obtain an etcd lock at once. Might want to increase crash loop tolerance or somehow loop startup command.
- Grafana metadata is stored in a pvc, so it cannot be transferred cluster-to-cluster. Would love to move to mysql, but the helm chart doesn't support it.
