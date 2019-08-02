# docker-shibboleth-sp-nginx
This docker image contains Nginx 1.16.0 with Shibboleth SP 3.0.4 running on Ubuntu 18.04. The image was built following [these instructions](https://github.com/nginx-shib/nginx-http-shibboleth). 

This image is meant to be used as a base image with local changes overriding the default configs.

Ports 80 and 443 are exposed.

## Use as a Base
To use this image as a base, just add your custom shibboleth and nginx configuration. For example a basic Dockerfile could look like:
```
FROM pennlabs/shibboleth-sp-nginx

COPY shibboleth/ /etc/shibboleth/
COPY nginx/ /etc/nginx/conf.d/
```
where `shibboleth` and `nginx` contain your custom configuration files like `shibboleth2.xml` and `default.conf`.

**WARNING** When using this image as a base, remember to generate a new TLS certificate and key for nginx.

## Update Nginx version (For package maintainers)
Use the following commands to build updated versions of the nginx modules.

These commands should be run in a similar environment as the docker image. An easy way of doing this is by creating an interactive version of docker-shibboleth-sp-nginx (`docker run -v ~/nginx-debs:/root/nginx-modules/deb/ -it pennlabs/shibboleth-sp-nginx /bin/bash`).
```
apt install nginx=<VERSION>
apt install -y git mercurial build-essential lsb-core devscripts fakeroot quilt libssl-dev libpcre3-dev zlib1g-dev
cd /root/
wget https://hg.nginx.org/pkg-oss/archive/tip.tar.gz
tar -xvf tip.tar.gz && mv pkg-oss-* pkg-oss/ && rm -f tip.tar.gz
pkg-oss/build_module.sh --skip-depends -y -o /root/nginx-modules/deb/ -n shibboleth -v `nginx -v 2>&1 | sed -n -e 's|^.*/||p' | tr -d '\n'` https://github.com/nginx-shib/nginx-http-shibboleth.git
pkg-oss/build_module.sh --skip-depends -y -o /root/nginx-modules/deb/ -n headersmore -v `nginx -v 2>&1 | sed -n -e 's|^.*/||p' | tr -d '\n'` https://github.com/openresty/headers-more-nginx-module.git
rm -f /root/nginx-modules/deb/*-dbg_*.deb
```

Now just copy the *.deb files from `~/nginx-deb/` on the host machine and commit them to the repo.