#!/bin/bash

helm upgrade --install --atomic bitwarden pennlabs/icarus -f values.yaml
