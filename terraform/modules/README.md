# Modules

Reusable terraform modules to keep our infrastructure DRY.

We've created the following modules:

* [Base Cluster](base_cluster) - a barebones K8s cluster with additional software installed
* [Postgres Cluster](postgres_cluster) - a module to create a postgres cluster as well as users/databases with correct default permissions
* [Vault Flush](vault_flush) - a module to flush updated secrets to vault
