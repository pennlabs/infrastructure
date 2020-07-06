FROM debian:buster-slim as build

ENV AWS_CLI_VERSION 2.0.27

# Install aws cli
RUN apt-get update \
    && apt-get install -y curl unzip \
    && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64-${AWS_CLI_VERSION}.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install --bin-dir /aws-cli-bin/


FROM debian:buster-slim

LABEL maintainer="Penn Labs"

# Install postgres tools
RUN apt-get update \
    && apt-get install -y postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy aws cli binary + config
COPY --from=build /usr/local/aws-cli/ /usr/local/aws-cli/
COPY --from=build /aws-cli-bin/ /usr/local/bin/

# Copy backup script
COPY backup /usr/local/bin/

WORKDIR /app/

CMD ["/usr/local/bin/backup"]
