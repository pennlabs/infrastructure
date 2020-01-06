#!/bin/bash

helm upgrade --install --atomic phpmyadmin pennlabs/icarus -f values.yaml
