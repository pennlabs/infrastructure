#!/bin/bash

helm upgrade --install --atomic consul ./consul-helm -f values.yaml -n kube-system