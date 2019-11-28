#!/bin/bash

helm upgrade --install etcd stable/etcd-operator -f values.yaml --namespace kube-system