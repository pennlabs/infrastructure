# Monitoring

We use Prometheus to export metrics and Grafana to analyze, graph, and alert on those metrics. Both are installed from their official "stable" Helm charts.

### Fluentd setup

Before helm installing fluentd, run `helm repo add kiwigrid https://kiwigrid.github.io`
 to be able to pull the `kiwigrid/fluentd-elasticsearch` chart.

### Add Grafana Credentials

First, create an Oauth app for grafana under the Pennlabs organization.

Create a secret in `secrets/data/grafana` with the following attributes:

- `admin-user` - username for grafana admin
- `admin-password` - password for grafana admin
- `GF_AUTH_GITHUB_CLIENT_ID` - Client ID for the Github OAuth app
- `GF_AUTH_GITHUB_CLIENT_Secret` - Secret for the Github OAuth app

Also, follow this guide to set up Slack:

https://medium.com/@_oleksii_/grafana-alerting-and-slack-notifications-3affe9d5f688
