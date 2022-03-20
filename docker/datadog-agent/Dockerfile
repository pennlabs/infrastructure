FROM gcr.io/datadoghq/agent:7.34.0

LABEL maintainer="Penn Labs"

RUN agent integration install -r -t datadog-cert_manager==2.2.0
RUN agent integration install -r -t datadog-traefik==1.0.0
