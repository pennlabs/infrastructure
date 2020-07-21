FROM themattrix/tox-base

# Install ssh 
RUN apt-get update && apt-get install -y ssh \
    && rm -rf /var/lib/apt/lists/*

# Install codecov
RUN pip install codecov
