#!/bin/bash

helm upgrade --install --atomic --version 0.1.8 phpmyadmin pennlabs/icarus -f values.yaml
