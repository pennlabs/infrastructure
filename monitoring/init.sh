#!/bin/bash

kubectl create ns monitoring
helm upgrade --install prometheus --atomic -f prometheus/values.yaml -n monitoring stable/prometheus
kubectl apply -f grafana/config.yaml
helm upgrade --install --atomic grafana -f grafana/values.yaml stable/grafana
helm upgrade --install fluentd kiwigrid/fluentd-elasticsearch -n monitoring -f logging/fluentd.yaml