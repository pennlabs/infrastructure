#!/bin/bash

INSTALL_DIR="/usr/local/bin"
WAYPOINT_VERSION="v1.0.1.2"
GITHUB_ORG="pennlabs"
REPO_NAME="infrastructure"

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
BINARY_SUFFIX=""
CWD=$(pwd)

case "$OS" in
    linux*)
        case "$ARCH" in
            x86_64|amd64)
                BINARY_SUFFIX="-linux-x86_64"
                ;;
            *)
                echo "Unsupported Linux architecture: $ARCH"
                exit 1
                ;;
        esac
        ;;
    darwin*)
        case "$ARCH" in
            arm64|aarch64)
                BINARY_SUFFIX="-macos-arm64"
                ;;
            x86_64|amd64)
                BINARY_SUFFIX="-macos-x86_64"
                ;;
            *)
                echo "Unsupported macOS architecture: $ARCH"
                exit 1
                ;;
        esac
        ;;
    *)
        echo "Unsupported operating system: $OS"
        exit 1
        ;;
esac

TMP_DIR=$(mktemp -d)
cd $TMP_DIR

echo "Downloading Waypoint for $OS $ARCH..."
curl -L "https://github.com/${GITHUB_ORG}/${REPO_NAME}/releases/download/${WAYPOINT_VERSION}/waypoint-client${BINARY_SUFFIX}" -o waypoint-client

chmod +x waypoint-client
sudo mv waypoint-client $INSTALL_DIR/

echo "Waypoint client installed successfully!"
echo "Run 'waypoint-client configure' to get started."
echo "Run 'waypoint-client --help' to see available commands."

rm -rf $TMP_DIR

cd $CWD
