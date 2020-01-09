# Read health checks
path "secrets/*"
{
  capabilities = ["list", "read"]
}

# List existing secret engines.
path "sys/mounts"
{
  capabilities = ["read"]
}

# Manage secret engines
path "sys/mounts/*"
{
  capabilities = ["list", "read"]
}