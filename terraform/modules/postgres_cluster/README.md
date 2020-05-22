# Postgres Cluster

A terraform module to create a postgres cluster on DigitalOcean and create users and databases such that a user can only access the database with the same name as it.

## Inputs

| Name            | Description                                                     |
|-----------------|-----------------------------------------------------------------|
| name            | Name for database cluster                                       |
| node_count      | Number of nodes in cluster                                      |
| node_size       | DigitalOcean size for database nodes (Default: db-s-1vcpu-1gb)  |
| cluster_version | Postgres version of the cluster (Default: 11)                   |
| users           | List of names to generate DBs and users from                    |

## Outputs

| Name           | Description                                                   |
|----------------|---------------------------------------------------------------|
| host           | Host of the created cluster                                   |
| port           | Port of the created cluster                                   |
| admin-user     | Admin username of the created cluster                         |
| admin-password | Admin password of the created cluster                         |
| version        | Version of the created cluster                                |
| passwords      | A map from usernames to passwords of all the `users` provided |
