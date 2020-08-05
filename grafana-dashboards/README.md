# Grafana Dashboards

This directory contains various Grafana Dashboard that we created.

Internally, we have Grafana set up to directly download the dashboard from Github.

## Dashboards

* **Traefik 1.7 Dashboard** - a dashboard to monitor the various traefik 1.7 instances we have. Based on [this dashboard](https://grafana.com/grafana/dashboards/4475)
* **Pod Dashboard** - a dashboard to monitor the status of all the pods within our clusters.
* **Pod Alerting Dashboard** - a dashboard to alert us when our pods exceed normal conditions. This dashboard is required because Grafana currently doesn't allow for variable datasources within an alert.
* **Cert Manager Dashboard** - a dashboard to see the status of our TLS certificates. Based on [this dashboard](https://grafana.com/grafana/dashboards/11001)
