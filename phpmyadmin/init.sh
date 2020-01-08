#!/bin/bash

helm upgrade --install --atomic --version 1.6.0 phpmyadmin pennlabs/icarus -f values.yaml
