FROM ubuntu:22.04

LABEL maintainer="Penn Labs"


# --- systems setup
RUN apt-get update && apt-get install --no-install-recommends -y gcc libpq-dev libc-dev \
  && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install --no-install-recommends -y curl git sudo \
  && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install --no-install-recommends -y python3-dev python3-pip python3-venv libpq-dev postgresql-client nano \
  && rm -rf /var/lib/apt/lists/*

RUN pip3 install uv pipenv

# --- labs setup
# TODO: install and set up postgres db w systemd
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y tzdata \
    && ln -fs /usr/share/zoneinfo/America/New_York /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata

RUN apt-get update && apt-get install -y postgresql postgresql-contrib redis-server systemd

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

RUN mkdir /opt/waypoint/
RUN mkdir /labs/


# For each product, setup the python environment
COPY waypoint-init /opt/waypoint/waypoint-init
RUN chmod +x /opt/waypoint/waypoint-init
RUN /opt/waypoint/waypoint-init

# start redis and postgres service
COPY database-init /opt/waypoint/database-init
RUN chmod +x /opt/waypoint/database-init

COPY . /opt/waypoint/cli
RUN cd /opt/waypoint/cli && pip install -e .

# Copy .bashrc
COPY waypoint-bashrc /root/.bashrc

# expose ports
EXPOSE 5432
EXPOSE 3000
EXPOSE 8000

