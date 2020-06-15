path "${PATH}/*"
{
  capabilities = ["list", "read"]
}

path "sys/mounts"
{
  capabilities = ["read"]
}

path "sys/mounts/*"
{
  capabilities = ["list", "read"]
}
