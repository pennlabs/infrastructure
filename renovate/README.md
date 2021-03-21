# Renovate

[Renovate](https://github.com/renovatebot/renovate) automates dependency updates. It's similar to [dependabot](https://dependabot.com/), but significantly more customizable.

We have a `renovate.json` file within this directory and then use renovate's [GitHub-hosted Presents](https://docs.renovatebot.com/config-presets/#github-hosted-presets) functionality to use this base config in all of our repos configured with renovate.

## Overview

Our current renovate config is set up so that we receive weekly PRs that group minor and patch updates, but individual (and immediate PRs) for major updates. If a package version is `<1.0.0` then we group patch updates in a weekly PR and receive individual PRs for minor updates because minor version bumps are assumed to be breaking when `<1.0.0`. See [SemVer](https://semver.org/) for an explanation of how most packages handle versioning.

## Configuration

This section will explain each configuration option specified in our renovate config.

### extends

Copy configuration from some default presets. See the [docs](https://docs.renovatebot.com/presets-default/) for a detailed explanation of each preset.

PR major releases individually, but combine minor and patch releases. Default to weekly PRs.

### rangeStrategy

[Docs](https://docs.renovatebot.com/configuration-options/#rangestrategy). Bump versions in non-lockfile (i.e. `package.json`).

### prConcurrentLimit

[Docs](https://docs.renovatebot.com/configuration-options/#prconcurrentlimit). Limit renovate to 5 open PRs.

### rebaseWhen

[Docs](https://docs.renovatebot.com/configuration-options/#rebasewhen). Rebase PRs when they fall behind the default branch.

### labels

[Docs](https://docs.renovatebot.com/configuration-options/#labels). Apply the `dependencies` label to all PRs.

### packageRules

[Docs](https://docs.renovatebot.com/configuration-options/#packagerules). Rules for specific packages.

The first object applies the `major` label to all PRs that bump major versions and configures renovate to make those PRs as soon as a new major version is released.

The second object applies to all packages with a version `<1.0.0`. It splits minor and patch PRs and adds a `pre-1-0-0` label to all PRs. For minor PRs it:

* disables grouping of PRs
* adds a `major` label to PRs (since minor bumps are often breaking changes pre `1.0.0`)
* configures renovate to make minor PRs as soon as a new minor version is released.

For patch PRs it groups all patch updates into one PR (that is run weekly by default).

### github-actions

Disable updating 3rd party GitHub Action actions. Since we're using cdkactions, we shouldn't modify the `.yaml` files directly.

### terraform

Disable updating terraform providers and modules. This is set because this repo (`infrastructure`) is using the same `renovate.json` and we currently don't want to monitor terraform versions while we're in the process of migrating to AWS. This should be removed once that migration is complete.
