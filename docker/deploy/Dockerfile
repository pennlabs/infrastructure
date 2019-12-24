FROM ubuntu:bionic

ENV HELM_VERSION v3.0.0
ENV TAR_NAME helm-${HELM_VERSION}-linux-amd64.tar.gz

RUN apt-get update \
    && apt-get install -y --no-install-recommends software-properties-common \
    && rm -rf /var/lib/apt/lists/*

RUN add-apt-repository ppa:rmescandon/yq && apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates wget git curl yq \
    && rm -rf /var/lib/apt/lists/*

RUN wget https://get.helm.sh/${TAR_NAME} \
    && tar xf $TAR_NAME \
    && mv linux-amd64/helm /usr/local/bin \
    && rm -rf $TAR_NAME linux-amd64

COPY deploy.sh /deploy.sh

CMD ["/deploy.sh"]
