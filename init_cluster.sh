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
tfcreds="$(cat tf/tf_creds.json)"

export AWS_ACCESS_KEY_ID=$(echo -E $tfcreds | jq -r '.AWS_ACCESS_KEY_ID.value')
export AWS_SECRET_ACCESS_KEY=$(echo -E $tfcreds | jq -r '.AWS_SECRET_ACCESS_KEY.value')
export KMS_KEY_ID=$(echo -E $tfcreds | jq -r '.KMS_KEY_ID.value')

export DB_USER=$(echo -E $tfcreds | jq -r '.DB_USER.value')
export DB_PASSWORD=$(echo -E $tfcreds | jq -r '.DB_PASSWORD.value')
export DB_NAME=$(echo -E $tfcreds | jq -r '.DB_NAME.value')
export DB_HOST=$(echo -E $tfcreds | jq -r '.DB_HOST.value')
export DB_PORT=$(echo -E $tfcreds | jq -r '.DB_PORT.value')

echo -E $tfcreds | jq -r '.KUBECONFIG.value' > kubeconfig.yaml

export KUBECONFIG=$PWD/kubeconfig.yaml

kubectl create ns staging

for dir in etcd traefik vault monitoring bitwarden; do
  cd $dir
  ./init.sh
  cd ..
done
