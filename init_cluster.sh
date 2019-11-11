#!/bin/bash

#######################
# CLUSTER INITIALIZER #
#######################
# This script:
# 1.) Grabs all secrets from tfstate and exposes them in environment variables
# 2.) Grabs kubeconfig from tfstate and writes it out
# 3.) Calls init scripts to create base Labs k8s deployment
# This script is to be called only after a succesful `terraform apply`

IFS=
tfstate="$(cat tf/terraform.tfstate)"

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
        .instances[0].attributes.key_id')

db_content=$(echo -E $tfstate | \
    jq -r '.resources | .[] | 
        select(.name == "mysql-vault" and .type == "digitalocean_database_cluster") |
        .instances[0].attributes')

export DB_USER=$(echo -E $db_content | jq -r '.user')
export DB_PASSWORD=$(echo -E $db_content | jq -r '.password')
export DB_NAME=$(echo -E $db_content | jq -r '.database')
export DB_HOST=$(echo -E $db_content | jq -r '.private_host')
export DB_PORT=$(echo -E $db_content | jq -r '.port')

echo -E $tfstate | \
    jq -r '.resources | .[] | 
        select(.name == "labs-testing" and .type == "digitalocean_kubernetes_cluster") |
        .instances[0].attributes.kube_config[0].raw_config' > \
        kubeconfig.yaml

export KUBECONFIG=$PWD/kubeconfig.yaml

kubectl create ns staging

for dir in traefik helm vault; do
  cd $dir
  ./init.sh
  cd ..
done
