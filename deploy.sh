#!/bin/bash

set -eo pipefail

curl -s -X GET -H "Content-Type: application/json" \
    -H "Authorization: Bearer $DO_AUTH_TOKEN" \
    "https://api.digitalocean.com/v2/kubernetes/clusters/${K8S_CLUSTER_ID}/kubeconfig" > /kubeconfig.conf

export KUBECONFIG=/kubeconfig.conf

IMAGE_TAG=${CIRCLE_SHA1}
# kill . in project names (i'm looking at you, pennlabs.org)
RELEASE_NAME="${CIRCLE_PROJECT_REPONAME//\./-}"

# this specifies what tag of icarus to pull down
DEPLOY_TAG=$(yq r k8s/values.yaml deploy_version)
if [ "$DEPLOY_TAG" == "null" ]; then
    echo "Could not find deploy tag"
    exit 1
fi

# temporarily disable staging until we get a proper strategy for managing databases
if [ "$CIRCLE_BRANCH" == "staging" ]; then
    exit 0
fi

helm repo add pennlabs https://helm.pennlabs.org/

helm upgrade $RELEASE_NAME  --install --set=image_tag=$IMAGE_TAG -f k8s/values.yaml --version "${DEPLOY_TAG}" pennlabs/icarus
