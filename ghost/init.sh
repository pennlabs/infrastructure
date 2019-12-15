#!/bin/bash

helm upgrade --install --atomic ghost -f values.yaml chart/
