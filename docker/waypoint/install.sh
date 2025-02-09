#!/bin/bash

INSTALL_DIR="/usr/local/bin"
WAYPOINT_VERSION="v0.0.2"
GITHUB_ORG="pennlabs"
REPO_NAME="infrastructure"

TMP_DIR=$(mktemp -d)
cd $TMP_DIR

echo "Downloading Waypoint..."
curl -L "https://github.com/${GITHUB_ORG}/${REPO_NAME}/releases/download/${WAYPOINT_VERSION}/waypoint-client" -o waypoint-client

chmod +x waypoint-client
sudo mv waypoint-client $INSTALL_DIR/

echo "Waypoint client installed successfully!"
echo "Run 'waypoint-client configure' to get started."
echo "Run 'waypoint-client --help' to see available commands."

rm -rf $TMP_DIR 