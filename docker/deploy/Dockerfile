FROM ubuntu:bionic

ENV CR_VERSION 0.2.3
ENV HELM_VERSION v3.0.0
ENV TAR_NAME helm-${HELM_VERSION}-linux-amd64.tar.gz

RUN apt-get update \
    && apt-get install -y --no-install-recommends software-properties-common \
    && rm -rf /var/lib/apt/lists/*

RUN add-apt-repository ppa:rmescandon/yq && apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates wget git curl yq ssh \
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

RUN git config --global user.email "pennappslabs@gmail.com" \
    && git config --global user.name "CircleCI"

RUN helm repo add pennlabs https://helm.pennlabs.org/

COPY deploy.sh /deploy.sh

CMD ["/deploy.sh"]
