#!/bin/bash

export KUBECONFIG=$HOME/projects/labs-k8s/labs-kubeconfig.yaml

echo -n "Enter deployment name: "
read dep_name
echo -n "Would you like to connect to staging or production? [production] "
read dep_type

if [ -z $dep_type ] || [ $dep_type == "production" ] || [ $dep_type == "prod" ]; then
  kubectl exec -it $(kubectl get pod | grep $dep_name | head -n 1 | cut -d " " -f 1) /bin/bash
  echo "Press enter to exit"
  read dummy
elif [ $dep_type == "staging" ]; then
  kubectl exec -n staging -it $(kubectl get pod -n staging | grep $dep_name | head -n 1 | cut -d " " -f 1) /bin/bash
  echo "Press enter to exit"
  read dummy
else
  echo "Please enter nothing, production, prod, or staging. You entered: ${dep_type}"
  echo "Press enter to exit"
  read dummy
fi

