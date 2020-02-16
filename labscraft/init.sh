#!/bin/bash

helm upgrade --install --atomic --set minecraftServer.eula=true -f values.yaml labscraft pennlabs/labscraft