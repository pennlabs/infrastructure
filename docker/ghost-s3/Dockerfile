FROM ghost:3.1 

RUN mkdir -p ./content.orig/adapters/storage

RUN npm install ghost-s3-storage-adapter && \
    cp -r ./node_modules/ghost-s3-storage-adapter \
    ./content.orig/adapters/storage/s3

ENV storage__active s3

