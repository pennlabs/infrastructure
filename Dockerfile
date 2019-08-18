FROM themattrix/tox-base

MAINTAINER Penn Labs

# Install ssh 
RUN apt-get update && apt-get install -y ssh \
    && rm -rf /var/lib/apt/lists/*

# Install coveralls
RUN pip install coveralls