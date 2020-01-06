#!/bin/bash

set -eo pipefail

## Get chart version and make sure it's an updated version

CHART_VERSION=$(yq r Chart.yaml version)

if [ "$CHART_VERSION" == "null" ]; then
    echo "Could not find chart version"
    exit 1
fi

set +e # allow grep to fail
git --no-pager tag | grep $CHART_VERSION

if [ $? == 0 ]; then
    echo "Chart with version ${CHART_VERSION} has already been published"
    exit 0
fi

set +e

git tag $CHART_VERSION
git push origin $CHART_VERSION

## Package with helm and upload to the helm-charts releases

helm package . --destination .deploy
cr upload -o pennlabs -r helm-charts -p .deploy

## Publish to helm-charts by cloning down with personal access token

cd ..
git clone https://github.com/pennlabs/helm-charts
cd helm-charts
git remote rm origin
git remote add origin "https://pennappslabs:${CR_TOKEN}@github.com/pennlabs/helm-charts.git"
git checkout gh-pages
cr index -i index.yaml -p .deploy -o pennlabs -r helm-charts --charts-repo https://github.com/pennlabs/helm-charts
git add index.yaml
git commit -m "release new version [ci skip]"
git push
