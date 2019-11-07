#!/bin/bash

if [ "$#" -ne 2 ]; then
    echo "Usage: ./get_creds.sh <k8s_cluster_id> <db_id>"
    exit 1
fi

if [ -z DIGITALOCEAN_ACCESS_TOKEN  ]; then
  echo "Please set DIGITALOCEAN_ACCESS_TOKEN"
  exit 1
fi

echo "Getting kubeconfig"
curl -s -X GET -H "Content-Type: application/json" \
    -H "Authorization: Bearer $DIGITALOCEAN_ACCESS_TOKEN" \
    "https://api.digitalocean.com/v2/kubernetes/clusters/$1/kubeconfig" > kubeconfig.yaml
echo "Kubeconfig now present in $PWD/kubeconfig.yaml. To start using kubectl, run: "
echo "    export KUBECONFIG=$PWD/kubeconfig.yaml"

echo ""

echo "Getting database information"
curl -s -X GET -H "Content-Type: application/json" \
    -H "Authorization: Bearer $DIGITALOCEAN_ACCESS_TOKEN" \
    "https://api.digitalocean.com/v2/databases/$2" > db_creds.json
echo "Database information now available in $PWD/db_creds.json"
