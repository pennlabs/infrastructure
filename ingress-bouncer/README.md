# Ingress Bouncer

This piece requires no additional configuration, but to see what/why it is, see below:

## The problem

Imagine you have a DNS entry pointing at your old cluster. When you want to migrate to your new cluster, you first want to fully spin up your new deployment on the new cluster. However, when Traefik tries to do the Let's Encrypt HTTP challenge, it won't be able to because it doesn't have the DNS entry pointed at it. When you move the DNS entry over to your new cluster, now you'll have Traefik serving the default certificate because it was never able to complete the HTTP challenge.

## The solution

The real solution to this problem is to use DNS challenges, but sometimes your DNS provider has a bad API, forcing you into HTTP challenges.

This project does the following every 5 minutes:

1. Get your ingress Load Balancer IP
2. Go through all your ingresses, doing the following
3. Checks if the host resolves to the LB IP; if not, skips everyting else
4. Checks if the cert for the host is valid; if it is, skip
5. Bounces the ingress by deleting and recreating it, triggering Traefik's on host rule
