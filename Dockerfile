FROM ubuntu:bionic

MAINTAINER Penn Labs

# Install dependencies
RUN apt-get update && apt-get install -y gnupg2 wget

# Add Shibboleth and Nginx repositories
RUN wget -qO - http://pkg.switch.ch/switchaai/SWITCHaai-swdistrib.asc | apt-key add - \
    && wget -qO - https://nginx.org/keys/nginx_signing.key | apt-key add - \
    && echo "deb http://pkg.switch.ch/switchaai/ubuntu bionic main" > /etc/apt/sources.list.d/switch-shibboleth.list \
    && echo "deb http://nginx.org/packages/ubuntu/ bionic nginx" > /etc/apt/sources.list.d/nginx.list

# Install Shibboleth, Nginx, and Supervisor
RUN apt-get update && apt-get install -y --no-install-recommends shibboleth=3.0.4+switchaai1~bionic1 \
    && apt-get install -y supervisor nginx=1.16.0-1~bionic

# Install Nginx modules
COPY nginx-modules/ /tmp/
RUN dpkg -i /tmp/*.deb

# Copy config files
COPY nginx-default.conf /etc/nginx/conf.d/default.conf
COPY supervisord.conf /etc/supervisor/
COPY nginx/ /etc/nginx/
COPY shibd.logger /etc/shibboleth/

# Set up Shibboleth directories
RUN mkdir /opt/shibboleth && chown _shibd:_shibd /opt/shibboleth
RUN mkdir /run/shibboleth && chown _shibd:_shibd /run/shibboleth

# Allow Nginx to access Shibboleth sockets
RUN adduser nginx _shibd

EXPOSE 80 443

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]