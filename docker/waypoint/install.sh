#!/bin/bash

INSTALL_DIR="/usr/local/bin"
WAYPOINT_VERSION="v0.0.2.0"
GITHUB_ORG="pennlabs"
REPO_NAME="infrastructure"

ARCH=$(uname -m)
BINARY_SUFFIX=""
case $ARCH in
    arm64|aarch64)
        BINARY_SUFFIX="-arm64"
        ;;
    x86_64|amd64)
        BINARY_SUFFIX=""
        ;;
    *)
        echo "Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

TMP_DIR=$(mktemp -d)
cd $TMP_DIR

echo "Downloading Waypoint for $ARCH architecture..."
curl -L "https://github.com/${GITHUB_ORG}/${REPO_NAME}/releases/download/${WAYPOINT_VERSION}/waypoint-client${BINARY_SUFFIX}" -o waypoint-client

chmod +x waypoint-client
sudo mv waypoint-client $INSTALL_DIR/

echo "Waypoint client installed successfully!"
echo "Run 'waypoint-client configure' to get started."
echo "Run 'waypoint-client --help' to see available commands."

rm -rf $TMP_DIR