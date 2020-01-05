FROM ubuntu:bionic

ENV CR_VERSION 0.2.3
ENV TAR_NAME helm-${HELM_VERSION}-linux-amd64.tar.gz

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates wget git \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir releaser && cd releaser \
    && wget https://github.com/helm/chart-releaser/releases/download/v${CR_VERSION}/chart-releaser_${CR_VERSION}_linux_amd64.tar.gz \
    && tar xf chart-releaser_${CR_VERSION}_linux_amd64.tar.gz \
    && mv cr /usr/local/bin \
    && cd .. && rm -rf releaser

CMD ["/publish.sh"]
