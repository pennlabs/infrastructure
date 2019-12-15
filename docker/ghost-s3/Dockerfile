FROM ghost:3.1 

# inspired by: https://github.com/macchie/docker-ghost-scs/blob/master/Dockerfile
# https://github.com/colinmeinke/ghost-storage-adapter-s3
RUN mkdir -p content.orig/adapters/storage

RUN npm install ghost-storage-adapter-s3 && \
    cp -r node_modules/ghost-storage-adapter-s3 \
    content.orig/adapters/storage/s3
