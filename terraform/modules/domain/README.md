# Domain

A terraform module to configure basic DNS records for a Penn Labs domain that:

* Allow for LE through our cloudflare proxy domain (TODO: make native with route53)
* Point the apex domain to traefik
* CNAME all subdomains to the apex domain
* Create SPF, DKIM, and CNAME records to send mail through mailgun
* Configure MX records to receive mail through Google.

| Name            | Description                           |
| --------------- | ------------------------------------- |
| domain          | Domain name to configure              |
| traefik_lb_name | DNS name of the traefik load balancer |
| traefik_zone_id | Zone ID of the traefik load balancer  |

## Outputs

None
