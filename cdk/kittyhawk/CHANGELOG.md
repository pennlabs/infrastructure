
## [1.2.0](https://github.com/pennlabs/infrastructure/compare/v1.1.0...v1.2.0) (2022-04-08)


### Features

* **datadog:** grafana feature parity ([#113](https://github.com/pennlabs/infrastructure/issues/113)) ([8f463ba](https://github.com/pennlabs/infrastructure/commit/8f463bab978553641735f54722adbd0cc5ff747e))

# Changelog
## 1.1.2 (2022-04-03)
* Dependency updates
    * Move cdk8s-cli from `devDependencies` to `dependencies`
    * Modify dependencies to use latest

## 1.1.1 (2022-03-28)
* Fix incorrect update snapshot bug during `yarn test`
* Make `name` of `PennLabsChart` optional with default value "pennlabs"

## 1.1.0 (2022-03-23)

* Initial release

## 1.0.7 (2021-02-05)

* Added domain parsing for certificate generation, using the `isSubdomain` flag passed along with each domain.
* Allow multiple domains in a Django application. 
    * `domain` property has been renamed to `domains`. `domains` requires is now an array where each object has type `{host: string, isSubdomain: boolean}`.
    * If multiple domains are defined, the `DOMAIN` environment variable will contain a comma-separated list of domains.
* Fix incorrect OHQ test, and updated other tests.
