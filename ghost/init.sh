#!/bin/bash

helm upgrade --install --atomic --version 0.1.6 ghost pennlabs/icarus -f values.yaml
