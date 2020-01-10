# Consul

We use consul as a key-value store. Right now, we're only using it as our Traefik storage backend. Consul stores certificates from Let's Encrypt so all the pods in the Traefik DaemonSet can serve HTTPS.
