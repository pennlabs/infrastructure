# Build stage
FROM ubuntu:bionic AS build

# Install dependencies
RUN apt-get update && apt-get install -y gnupg2 wget git mercurial build-essential lsb-core devscripts fakeroot quilt libssl-dev libpcre3-dev zlib1g-dev

# Add Nginx repository and install
RUN wget -qO - https://nginx.org/keys/nginx_signing.key | apt-key add - \
    && echo "deb http://nginx.org/packages/ubuntu/ bionic nginx" > /etc/apt/sources.list.d/nginx.list \
    && apt update && apt install nginx

# Install pkg-oss
WORKDIR /root/
RUN mkdir -p /root/nginx-modules/deb/ \
    && wget https://hg.nginx.org/pkg-oss/archive/tip.tar.gz \
    && tar -xvf tip.tar.gz && mv pkg-oss-* pkg-oss/ && rm -f tip.tar.gz

# Build Nginx modules
RUN pkg-oss/build_module.sh --skip-depends -y -o /root/nginx-modules/deb/ -n shibboleth -v `nginx -v 2>&1 | sed -n -e 's|^.*/||p' | tr -d '\n'` https://github.com/nginx-shib/nginx-http-shibboleth.git \
    && pkg-oss/build_module.sh --skip-depends -y -o /root/nginx-modules/deb/ -n headersmore -v `nginx -v 2>&1 | sed -n -e 's|^.*/||p' | tr -d '\n'` https://github.com/openresty/headers-more-nginx-module.git \
    && rm -f /root/nginx-modules/deb/*-dbg_*.deb

# Production stage
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
    && apt-get install -y supervisor nginx

# Install Nginx modules
COPY --from=build /root/nginx-modules/deb/*.deb /tmp/
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