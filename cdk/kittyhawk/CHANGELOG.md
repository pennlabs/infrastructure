# Changelog

## 1.1.5 (2022-06-20)
* Add feature branch deploy:
    * Support `DEPLOY_TO_FEATURE_BRANCH` env variables in resources.

## 1.1.4 (2022-04-18)

* Better handling of custom ports
    * Fix bug for ingress ports
    * Disallow custom ports within ingress prop in `Application` and its extended classes
    * Update tests & snapshots
* Update `API.md` file

## 1.1.3 (2022-04-08)

* Upgrade dependencies and fix projen version configuration

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
