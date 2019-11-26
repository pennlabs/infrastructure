#!/bin/bash

set -x

curl -X GET -H "Content-Type: application/json" \
    -H "Authorization: Bearer $DO_AUTH_TOKEN" \
    "https://api.digitalocean.com/v2/kubernetes/clusters/${K8S_CLUSTER_ID}/kubeconfig" > /kubeconfig.conf

export KUBECONFIG=/kubeconfig.conf

IMAGE_TAG=${CIRCLE_SHA1}
STAGING_ON="false"
# kill . in project names (i'm looking at you, pennlabs.org)
RELEASE_NAME="${CIRCLE_PROJECT_REPONAME//\./-}"

if [ "$CIRCLE_BRANCH" == "staging" ]; then
    STAGING_ON="true"
    RELEASE_NAME="${RELEASE_NAME}-staging"
fi

helm upgrade $RELEASE_NAME  --install --set=staging=$STAGING_ON,image.tag=$IMAGE_TAG -f k8s/values.yml k8s/chart
