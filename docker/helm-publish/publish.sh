#!/bin/bash

set -eo pipefail

helm package icarus --destination .deploy
cr upload -o pennlabs -r helm-charts -p .deploy
git checkout gh-pages
cr index -i index.yaml -p .deploy -o pennlabs -r helm-charts --charts-repo https://github.com/pennlabs/helm-charts
git add index.yaml
git commit -m "release new version [ci skip]"
git push
git checkout master
rm -rf .deploy
