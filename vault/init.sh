#!/bin/bash

envsubst < vault-secrets.yaml | kubectl apply -f -
envsubst < values.yaml | helm upgrade --install vault ./vault-helm -f -

kubectl apply -f sync-job.yaml
kubectl apply -f vault-ingress.yaml
kubectl apply -f sync-rbac.yaml
