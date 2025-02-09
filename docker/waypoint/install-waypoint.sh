#!/bin/bash

# Clone only the docker/waypoint folder from the add-waypoint branch
git clone --branch add-waypoint --depth 1 --filter=blob:none --sparse https://github.com/pennlabs/infrastructure.git
cd infrastructure
git sparse-checkout init --cone
git sparse-checkout set docker/waypoint

# Make the install.sh script executable
chmod +x docker/waypoint/install.sh

# Run the install.sh script
bash docker/waypoint/install.sh

cd docker/waypoint
