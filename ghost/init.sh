#!/bin/bash

helm upgrade --install --atomic --version 0.1.8 ghost pennlabs/icarus -f values.yaml
