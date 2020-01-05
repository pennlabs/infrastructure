FROM ubuntu:bionic

ENV CR_VERSION 0.2.3
ENV HELM_VERSION v3.0.0
ENV TAR_NAME helm-${HELM_VERSION}-linux-amd64.tar.gz

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates wget git \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir releaser && cd releaser \
    && wget https://github.com/helm/chart-releaser/releases/download/v${CR_VERSION}/chart-releaser_${CR_VERSION}_linux_amd64.tar.gz \
    && tar xf chart-releaser_${CR_VERSION}_linux_amd64.tar.gz \
    && mv cr /usr/local/bin \
    && cd .. && rm -rf releaser

RUN wget https://get.helm.sh/${TAR_NAME} \
    && tar xf $TAR_NAME \
    && mv linux-amd64/helm /usr/local/bin \
    && rm -rf $TAR_NAME linux-amd64

COPY publish.sh /publish.sh

CMD ["/publish.sh"]
