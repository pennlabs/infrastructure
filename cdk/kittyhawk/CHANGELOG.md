# Changelog

## 1.0.7 (2021-02-04)

* Added domain parsing for certificate generation, using the `isSubdomain` flag passed along with each domain.
* Allow multiple domains in a Django application. 
    * `domain` property has been renamed to `domains`. `domains` requires is now an array where each object has type `{host: string, isSubdomain: boolean}`.
    * If multiple domains are defined, the `DOMAIN` environment variable will contain a comma-separated list of domains.
* Fix incorrect OHQ test, and updated other tests.
