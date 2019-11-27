# Infrastructure

In this repo, you can find all the configs for Pennlabs' infrastructure. Information on how to create a cluster from scratch are in [Bootstrapping](/BOOTSTRAPPING.md).

## Guide

| Directory  | Purpose                                          |
|------------|--------------------------------------------------|
| docker     | Infrastructure-specific Dockerfiles              |
| monitoring | K8s configs needed to set up Prometheus, Grafana |
| tf         | Terraform configs for all infrastructure         |
| traefik    | K8s configs needed to set up traefik             |
| vault      | K8s configs needed to set up vault               |
