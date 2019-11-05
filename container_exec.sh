#!/bin/bash

if [ -z $1 ]; then
  cat <<EOF
Usage:
./get_scores.sh <app_name> [1 for staging, 0 for prod]
EOF
exit 1
fi

if [ -z $2 ] || [ $2 == "0" ]; then
  kubectl exec -it $(kubectl get pod | grep $1 | head -n 1 | cut -d " " -f 1) /bin/bash
else
  kubectl exec -n staging -it $(kubectl get pod -n staging | grep $1 | head -n 1 | cut -d " " -f 1) /bin/bash
fi

