FROM debian:buster-slim

ENV CR_VERSION 0.2.3
ENV HELM_VERSION v3.0.0
ENV YQ_VERSION 2.4.1
ENV TAR_NAME helm-${HELM_VERSION}-linux-amd64.tar.gz

RUN apt-get update \
    && apt-get install -y --no-install-recommends software-properties-common \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates wget git curl ssh \
    && rm -rf /var/lib/apt/lists/*

RUN wget https://github.com/mikefarah/yq/releases/download/${YQ_VERSION}/yq_linux_amd64 \
    && mv yq_linux_amd64 /usr/local/bin/yq \
    && chmod +x /usr/local/bin/yq

RUN mkdir releaser && cd releaser \
    && wget https://github.com/helm/chart-releaser/releases/download/v${CR_VERSION}/chart-releaser_${CR_VERSION}_linux_amd64.tar.gz \
    && tar xf chart-releaser_${CR_VERSION}_linux_amd64.tar.gz \
    && mv cr /usr/local/bin \
    && cd .. && rm -rf releaser

RUN wget https://get.helm.sh/${TAR_NAME} \
    && tar xf $TAR_NAME \
    && mv linux-amd64/helm /usr/local/bin \
    && rm -rf $TAR_NAME linux-amd64
