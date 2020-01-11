#!/bin/bash

helm upgrade --install --atomic ingress-bouncer pennlabs/ingress-bouncer -f values.yaml -n kube-system