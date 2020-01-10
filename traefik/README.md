# Traefik

Every cluster needs a way to actually route traffik from the outside world to the inside of the cluster. Traefik allows to create Ingress resources and automatically have SSL and routing to the appropriate service in-cluster. We run Traefik in a DaemonSet using Consul as the storage backend. For more info on Traefik, [read the docs](https://docs.traefik.io/).
