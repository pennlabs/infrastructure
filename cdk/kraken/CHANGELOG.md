# Changelog

## X.Y.Z (UNRELEASED)

## 0.8.12 (2023-10-03)

- Update DjangoCheckJob to have codecov token

## 0.8.11 (2023-10-02)

- Update DjangoCheckJob to account for codecov deprecation

## 0.8.10 (2022-11-05)

- Docker image: support build args

## 0.8.6 (2022-04-08)

- Upgrade dependencies and fix projen version configuration

## 0.8.5 (2022-04-05)

- CDK publish: fix conditional publish check

## 0.8.4 (2022-04-03)

- CDK publish: fix version_check id location

## 0.8.3 (2022-04-03)

- CDK publish: force jq exit code to be 0

## 0.8.2 (2022-04-03)

- Fix CDK publish npm version check output

## 0.8.1 (2022-04-01)

- Fix deploy job environment variable handling
- Fix CDK publish stack by installing jq

## 0.8.0 (2022-03-29)

- Migrate to kittyhawk for deployments
- Modify CDK stack to only publish when a new version is pushed

## 0.7.1 (2021-12-16)

- Modify PyPI to correctly publish (again)

## 0.7.0 (2021-12-04)

- Modify PyPI python versions to be strings
- Modify PyPI to correctly publish
- Migrate to ts-dedent

## 0.6.4 (2021-10-04)

- Modify PyPI publish to use poetry

## 0.6.3 (2021-08-26)

- Pin OS to buster within django check

## 0.6.2 (2021-04-04)

- Add poetry install to PyPI stack

## 0.6.1 (2021-04-04)

- Fix PyPI job dependencies

## 0.6.0 (2021-04-01)

- Modify PyPI stack to use a matrix

## 0.5.1 (2021-03-17)

- Remove unused env var from deploy job

## 0.5.0 (2021-02-25)

- Modify deploy job to deploy to AWS EKS

## 0.4.12 (2021-02-17)

- Hotfix deploy job part 2

## 0.4.11 (2021-02-17)

- Hotfix deploy job

## 0.4.10 (2021-02-13)

- Modify deploy script to fully fail if a single command fails

## 0.4.9 (2021-02-11)

- Create an auto-approve stack for dependabot PRs

## 0.4.8 (2021-02-04)

- Only publish docs in cdk stack on default branch

## 0.4.7 (2021-01-30)

- Bugfix post-integration publish job again

## 0.4.6 (2021-01-30)

- Bugfix post-integration publish job

## 0.4.5 (2021-01-30)

- Update `docker/build-push-action` to v2
- Complete integration test job

## 0.3.10 (2020-12-30)

- Initial beta release
