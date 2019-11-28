#!/bin/bash

helm upgrade --install --atomic etcd stable/etcd-operator -f values.yaml --namespace kube-system
