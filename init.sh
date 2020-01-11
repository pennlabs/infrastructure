#!/bin/bash

if [ $# -ne 2 ]; then
    echo "Usage: ./init.sh <name of image> <name of github repo>"
    exit 1
fi

find . -type f -exec sed -i "s/image-name/$1/g" {} \;
find . -type f -exec sed -i "s/github-project/$2/g" {} \;

mv README.md.template README.md

rm init.sh
