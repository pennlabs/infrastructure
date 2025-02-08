#!/bin/bash

INSTALL_DIR="/usr/local/bin"
WAYPOINT_VERSION="0.0.1"
GITHUB_ORG="pennlabs"
REPO_NAME="infrastructure"

TMP_DIR=$(mktemp -d)
cd $TMP_DIR

echo "Downloading Waypoint..."
curl -L "https://github.com/${GITHUB_ORG}/${REPO_NAME}/releases/download/waypoint-client-v${WAYPOINT_VERSION}/waypoint-client" -o waypoint-client

chmod +x waypoint-client
sudo mv waypoint-client $INSTALL_DIR/

echo "Waypoint client installed successfully!"
echo "Run 'waypoint-client configure' to get started."

rm -rf $TMP_DIR 