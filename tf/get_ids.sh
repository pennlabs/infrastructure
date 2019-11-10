#!/bin/bash

tfstate=$(cat terraform.tfstate)

export AWS_ACCESS_KEY_ID=$(echo -E $tfstate | \
    jq -r '.resources | .[] | 
        select(.name == "vault-unsealer" and .type == "aws_iam_access_key") |
        .instances[0].attributes.id')

export AWS_SECRET_ACCESS_KEY=$(echo -E $tfstate | \
    jq -r '.resources | .[] | 
        select(.name == "vault-unsealer" and .type == "aws_iam_access_key") |
        .instances[0].attributes.secret')

export KMS_KEY_ID=$(echo -E $tfstate | \
    jq -r '.resources | .[] | 
        select(.name == "vault-unseal-key" and .type == "aws_kms_key") |
        .instances[0].key_id')

db_content=$(echo -E $tfstate | \
    jq -r '.resources | .[] | 
        select(.name == "mysql-vault" and .type == "digitalocean_database_cluster") |
        .instances[0].attributes')

export DB_USER=$(echo -E $db_content | jq -r '.user')
export DB_PASSWORD=$(echo -E $db_content | jq -r '.password')
export DB_NAME=$(echo -E $db_content | jq -r '.database')
export DB_HOST=$(echo -E $db_content | jq -r '.private_host')
export DB_PORT=$(echo -E $db_content | jq -r '.port')

cat terraform.tfstate | \
    jq -r '.resources | .[] | 
        select(.name == "labs-testing" and .type == "digitalocean_kubernetes_cluster") |
        .instances[0].attributes.kube_config[0].raw_config' > \
        kubeconfig.yaml
