#!/bin/bash

cat <<EOF > /etc/vault.d/vault.hcl
ui = true

listener "tcp" {
  address       = "0.0.0.0:8200"
  tls_cert_file = "/opt/vault/tls/tls.crt"
  tls_key_file  = "/opt/vault/tls/tls.key"
}

storage "postgresql" {
  connection_url = "${connection_url}"
  max_parallel = "4"
}

seal "awskms" {
  region     = "us-east-1"
  kms_key_id = "${kms_key_id}"
}
EOF
