#!/bin/bash

helm upgrade --install --atomic --version 0.1.8 bitwarden pennlabs/icarus -f values.yaml
