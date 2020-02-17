#!/bin/bash

# Timber also requires secrets. Right now, they exist in vault and are manually copied to monitoring, but once I add
# cronjobs to icarus, we'll just sync to all namespaces.

kubectl create ns monitoring
helm upgrade --install prometheus --atomic -f prometheus/values.yaml --namespace monitoring stable/prometheus
kubectl apply -f grafana/config.yaml
helm upgrade --install --atomic grafana -f grafana/values.yaml stable/grafana
kubectl apply -f timber

