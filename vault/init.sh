#!/bin/bash

#####################
# VAULT INITIALIZER #
#####################
# This script should be called from `init.cluster.sh` so that all the appropriate environment variables are exposed.
# This script uses `envsubst` to template out sensitive config files and to create the vault deployment

envsubst < vault-secrets.yaml | kubectl apply -f -
envsubst < values.yaml | helm upgrade --install vault ./vault-helm -f -

kubectl apply -f secret-sync-job.yaml
kubectl apply -f secret-sync-rbac.yaml
kubectl apply -f vault-ingress.yaml
kubectl apply -f team-sync-job.yaml
