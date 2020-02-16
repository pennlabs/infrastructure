#!/bin/bash

helm upgrade --set minecraftServer.eula=true -f values.yaml labscraft stable/minecraft