FROM ubuntu:22.04

LABEL maintainer="Penn Labs"

# --- systems setup
RUN apt-get update && apt-get install --no-install-recommends -y gcc libpq-dev libc-dev \
  && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install --no-install-recommends -y curl \
  && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install --no-install-recommends -y python3 python3-pip python3-venv \
  && rm -rf /var/lib/apt/lists/*

RUN pip3 install uv

RUN pip3 install pipenv

# --- labs setup
# TODO: install and set up postgres db w systemd

# Install nvm, node, and npm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
RUN nvm install 22

# For each product, setup the python environment
RUN mkdir /opt/waypoint/
COPY env-sync /opt/waypoint/env-sync
RUN chmod +x /opt/waypoint/env-sync
RUN /opt/waypoint/env-sync

# TODO: copy over waypoint helper scripts
