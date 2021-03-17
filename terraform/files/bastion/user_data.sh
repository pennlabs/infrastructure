#!/bin/bash

# Variables
KUBECTL_VERSION="v1.20.4"
AWS_CLI_VERSION="2.0.30"

# Install packages
apt-get install -y unzip

# Move exec files to local bin
cat <<EOF > /usr/local/bin/container_exec_entry.sh
${CONTAIN_EXEC_ENTRY}
EOF
cat <<EOF > /usr/local/bin/container_exec.sh
${CONTAIN_EXEC}
EOF
chmod +x /usr/local/bin/container_exec_entry.sh
chmod +x /usr/local/bin/container_exec.sh

# Make user
adduser --disabled-password --gecos "" jump

# Add SSH keys to jump user
mkdir /home/jump/.ssh
cat <<EOF > /home/jump/.ssh/authorized_keys
${SSH_AUTHORIZED_KEYS}
EOF
chown jump:jump /home/jump/.ssh/authorized_keys

# Install kubectl
curl -LO "https://dl.k8s.io/release/$${KUBECTL_VERSION}/bin/linux/amd64/kubectl"
chmod +x kubectl
mv kubectl /usr/local/bin/

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64-$${AWS_CLI_VERSION}.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm awscliv2.zip
rm -r aws

# Generate kubeconfig
su jump -c "aws eks --region us-east-1 update-kubeconfig --name production"

# Set jump shell
chsh jump -s /usr/local/bin/container_exec_entry.sh
