#!/bin/bash

helm upgrade --install --atomic bitwarden -f values.yml chart/
