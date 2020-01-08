# Bitwarden

Bitwarden_rs is an unofficial rust rewrite of Bitwarden. Bitwarden itself is a web-based password management system with team support so Penn Labs can easily share passwords with groups of people.

Here are the secrets that need to be set:

| Key              | Description                       |
|------------------|-----------------------------------|
| `ADMIN_TOKEN`    | Token to access the admin page    |
| `DATABASE_URL`   | URI to access the MySQL DB        |
| `DOMAIN`         | Domain to access Bitwarden        |
| `SMTP_FROM`      | Email address to send emails from |
| `SMTP_FROM_NAME` | Name to use when sending emails   |
| `SMTP_HOST`      | SMTP host to use                  |
| `SMTP_PASSWORD`  | SMTP username                     |
| `SMTP_USERNAME`  | SMTP password                     |

Other configuration can also be set as `extraEnv` in values.yaml. Right now, it just disables WAL and sign-ups without an invitation. See the [sample env file](https://github.com/dani-garcia/bitwarden_rs/blob/master/.env.template) for all configuration options.
