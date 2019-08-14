# docker-shibboleth-sp-nginx
This docker image contains Nginx with Shibboleth SP 3.0.4 running on Debian Buster (Slim). The image was built following [these instructions](https://github.com/nginx-shib/nginx-http-shibboleth).

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

**WARNING** When using this image as a base, you must generate a new TLS certificate and key for nginx (`cert.pem` and `key.pem`). Copy them to `/etc/nginx/`.
