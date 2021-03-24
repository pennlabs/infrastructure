#!/bin/bash

# Need to escape all $ because of TF formatting
# Disable environment type since staging doesn't exist yet
# echo -n "Would you like to connect to staging or production? [production] "
# read dep_type

# if [ -z \$dep_type ] || [ \$dep_type == "production" ] || [ \$dep_type == "prod" ]; then
# 	namespace="default"
# elif [ \$dep_type == "staging" ]; then
# 	namespace="staging"
# else
#   echo "Please enter nothing, production, prod, or staging. You entered: \${dep_type}"
#   echo "Press enter to exit"
#   read dummy
# 	exit 1
# fi
namespace="default"

echo "List of deployments: "
kubectl get deployment -n \$namespace

echo -n "Enter deployment name: "
read dep_name

kubectl exec -it -n \$namespace \$(kubectl get pod -n \$namespace | grep \$dep_name | head -n 1 | cut -d " " -f 1) -- /bin/bash
echo "Press enter to exit"
read
