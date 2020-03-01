#!/bin/bash

helm upgrade --install --version 1.1.12 --set minecraftServer.eula=true -f values.yaml labscraft pennlabs/minecraft
