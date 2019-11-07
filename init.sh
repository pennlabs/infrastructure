#!/bin/bash

db_content=$(cat db_creds.json)

export DB_USER=$(echo $db_content | jq -r '.database.connection.user')
export DB_PASSWORD=$(echo $db_content | jq -r '.database.connection.password')
export DB_NAME=$(echo $db_content | jq -r '.database.connection.database')
export DB_HOST=$(echo $db_content | jq -r '.database.connection.host')
export DB_PORT=$(echo $db_content | jq -r '.database.connection.port')

export KUBECONFIG=$PWD/kubeconfig.yaml

dirs='traefik vault'

for dir in $dirs; do
  cd $dir
  ./init.sh
  cd ..
done
