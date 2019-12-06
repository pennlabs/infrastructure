# Labs Helm

Labs helm is what actually does the deployment for all our products. It executes the following steps:

1. Get KUBECONFIG from digitalocean API
2. Detect if you're on the staging branch of the repo
3. Idempotently installs the helm chart in `k8s/chart` with the values in `k8s/values.yml`
