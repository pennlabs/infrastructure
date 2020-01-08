#!/bin/bash

kubectl create ns monitoring
helm upgrade --install prometheus --atomic -f prometheus/values.yaml --namespace monitoring stable/prometheus
kubectl apply -f grafana/config.yaml
helm upgrade --install --atomic grafana -f grafana/values.yaml stable/grafana
# helm upgrade --install fluentd stable/fluentd-elasticsearch -n monitoring -f logging/fluentd.yaml
# helm upgrade --install elasticsearch elastic/elasticsearch -n monitoring
# helm upgrade --install kibana elastic/kibana -f logging/kibana.yaml -n monitoring
