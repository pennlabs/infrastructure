FROM ubuntu:22.04

LABEL maintainer="Penn Labs"

# --- systems setup
RUN apt-get update && apt-get install --no-install-recommends -y gcc libpq-dev libc-dev \
  && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install --no-install-recommends -y curl git \
  && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install --no-install-recommends -y python3-dev python3-pip python3-venv libpq-dev postgresql-client \
  && rm -rf /var/lib/apt/lists/*

RUN pip3 install uv pipenv

# --- labs setup
# TODO: install and set up postgres db w systemd
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y tzdata \
    && ln -fs /usr/share/zoneinfo/America/New_York /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata

RUN apt-get update && apt-get install -y postgresql postgresql-contrib redis-server \
  && rm -rf /var/lib/apt/lists/*

# expose ports
EXPOSE 5432
EXPOSE 3000
EXPOSE 8000

# Install nvm, node, and npm, yarn
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 22

RUN mkdir -p $NVM_DIR && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && \
    . $NVM_DIR/nvm.sh && \
    nvm install $NODE_VERSION && \
    nvm alias default $NODE_VERSION && \
    nvm use default

RUN . $NVM_DIR/nvm.sh && npm install -g yarn

# start redis and postgres service
RUN redis-server --daemonize yes
RUN service postgresql start

# For each product, setup the python environment
RUN mkdir /opt/waypoint/
COPY waypoint-init /opt/waypoint/waypoint-init
RUN chmod +x /opt/waypoint/waypoint-init
RUN /opt/waypoint/waypoint-init
