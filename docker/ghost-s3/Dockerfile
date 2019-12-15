FROM ghost:3.1 

# inspired by: https://github.com/macchie/docker-ghost-scs/blob/master/Dockerfile
# https://github.com/colinmeinke/ghost-storage-adapter-s3
RUN mkdir -p content/adapters/storage
RUN npm install ghost-s3-storage-adapter && \
    cp -r node_modules/ghost-s3-storage-adapter \
    content/adapters/storage/s3
