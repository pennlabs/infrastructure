# Modules

Reusable terraform modules to keep our infrastructure DRY.

We've created the following modules:

* [Base Cluster](base_cluster) - a barebones K8s cluster with additional software installed
* [IAM](iam) - a module to create an IAM role that can be assumed from Kubernetes
* [Vault](vault) - a module to configure vault with all the secrets we need
* [Vault Flush](vault_flush) - a module to flush updated secrets to vault
