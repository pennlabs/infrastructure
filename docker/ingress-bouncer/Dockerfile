FROM golang:1.13-buster as build

LABEL maintainer="Peyton Walters <pwpon500@gmail.com>"

WORKDIR /app

# Copy over source
COPY go.mod go.sum ./
RUN go mod download
COPY . .

# Build
RUN go build -o ingress-bouncer .

FROM debian:buster-slim

RUN apt-get update \
    && apt-get install --no-install-recommends -y ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/ingress-bouncer /ingress-bouncer

CMD ["/ingress-bouncer"]