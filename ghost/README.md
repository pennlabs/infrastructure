# Ghost

Ghost is a Content Management System (CMS) for blogging. Think of it like the backend of a blog, but it's built so that it can be very easily accessed via an API. An example for NextJS is [here](https://ghost.org/docs/api/v3/nextjs/).

Normally ghost is configured using a JSON file. But we can also set all the configuration through environment variables, where
nested fields are accessed with a double underscore, just like in the Django ORM.

Here are the secrets that need to be set:

|               Key                       |  Description                                                |
|-----------------------------------------|-------------------------------------------------------------|
<<<<<<< HEAD
| `AWS_ACCESS_KEY_ID`                     |  Access key for user with access to bucket  |
| `AWS_DEFAULT_REGION`                    |  Region for bucket |
| `AWS_SECRET_ACCESS_KEY`                 |  Secret access key for user with access to bucket  |
| `GHOST_STORAGE_ADAPTER_S3_PATH_BUCKET`  |  Bucket name  |
=======
| `AWS_ACCESS_KEY_ID`                     |                                                             |
| `AWS_DEFAULT_REGION`                    |                                                             |
| `AWS_SECRET_ACCESS_KEY`                 |                                                             |
| `GHOST_STORAGE_ADAPTER_S3_PATH_BUCKET`  |                                                             |
>>>>>>> master
| `database__connection__database`        | The name of the MySQL database to be used to store content. |
| `database__connection__host`            | Hostname for the MySQL database.                            |
| `database__connection__user`            | Database user for ghost to log in as.                       |
| `database__connection__password`        | Password for the MySQL database user.                       |
| `mail__options__auth__user`             | SMTP user                                                   |
| `mail__options__auth__pass`             | SMTP password                                               |

Other configuration can also be set as `extraEnv` in values.yaml. 
Right now, this includes things like the default ports for MySQL and SMTP.
See the [official documentation](https://ghost.org/docs/concepts/config/) for all configuration options.
