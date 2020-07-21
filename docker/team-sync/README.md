# Docker Team Sync

[![CircleCI](https://circleci.com/gh/pennlabs/docker-team-sync.svg?style=shield)](https://circleci.com/gh/pennlabs/docker-team-sync)
[![Docker Pulls](https://img.shields.io/docker/pulls/pennlabs/team-sync)](https://hub.docker.com/r/pennlabs/team-sync)

This repository contains a docker image that performs various syncing updates related to Penn Labs' Github teams. The image dynamically loads python files in `sync/modules` and executes their `sync` method.
