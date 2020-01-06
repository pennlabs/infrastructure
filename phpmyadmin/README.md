# phpMyAdmin

phpMyAdmin is a web-based SQL management system.

Here are the secrets that need to be set:

| Key                    | Description                  |
|------------------------|------------------------------|
| `DATABASE_HOST`        | Host for the database        |
| `DATABASE_PORT_NUMBER` | Port number for the database |

Other configuration can also be set as `extraEnv` in values.yaml. Right now, just disabled password-less access to phpmyadmin. See the [docker image's git repo](https://github.com/bitnami/bitnami-docker-phpmyadmin) for all configuration options.
