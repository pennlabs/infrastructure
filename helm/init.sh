#!/bin/bash

kubectl apply -f rbac-config.yaml
# have to use this insane command to patch helm to work with k8s 1.16. will remove once support is added.
helm init --service-account tiller --override spec.selector.matchLabels.'name'='tiller',spec.selector.matchLabels.'app'='helm' --output yaml | sed 's@apiVersion: extensions/v1beta1@apiVersion: apps/v1@' | kubectl apply --wait -f -
