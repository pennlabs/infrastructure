FROM ubuntu:20.04

LABEL maintainer="Penn Labs"


# --- systems setup
RUN apt-get update && apt-get install --no-install-recommends -y gcc libpq-dev libc-dev

RUN apt-get update && apt-get install --no-install-recommends -y curl git \
  sudo python3-dev python3-pip python3-venv libpq-dev postgresql-client nano \
  htop vim net-tools procps sysstat strace tcpdump lsof \
  && rm -rf /var/lib/apt/lists/*

# Install locales and configure the correct locale
RUN apt-get update && apt-get install -y locales
RUN locale-gen en_US.UTF-8
RUN update-locale LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8

RUN pip3 install uv pipenv

# --- labs setup
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y tzdata \
  && ln -fs /usr/share/zoneinfo/America/New_York /etc/localtime \
  && dpkg-reconfigure -f noninteractive tzdata

RUN apt-get update && apt-get install -y postgresql postgresql-contrib redis-server systemd

# Install nvm, node, and npm, yarn
ENV NVM_DIR=/usr/local/nvm
ENV NODE_VERSION=22

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

RUN mkdir -p /opt/waypoint/cli
COPY . /opt/waypoint/cli
WORKDIR /opt/waypoint/cli
RUN pip3 install .

WORKDIR /

# Copy .bashrc
COPY waypoint-bashrc /root/.bashrc

# expose ports
EXPOSE 5432
EXPOSE 3000
EXPOSE 8000
