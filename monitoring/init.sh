#!/bin/bash

kubectl create ns monitoring
helm upgrade --install prometheus -f prometheus/values.yaml --namespace monitoring stable/prometheus
kubectl apply -f grafana/config.yaml
helm upgrade --install grafana -f grafana/values.yaml stable/grafana
