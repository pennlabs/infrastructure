# Docker Template

This template repo contains the base configuration needed to publish a docker image.

## Installation

Click the green "Use this template" button and make a new repo with your desired name. Run the provided init script `./init.sh <name of image> <name of github repo>` to configure most of the project. See the configuration section for final changes that need to be made.

## Usage

With every commit pushed to master, CircleCI will build a docker image based on the master branch and tag with "latest" and the git commit sha and push that image to Docker Hub.

## Features

* CircleCI
  * Workflow to build and publish your image to Docker Hub using contexts to keep CircleCI credentials safe
* Docker
  * .dockerignore file to prevent common unnecessary files from being adding to the docker image
* MIT License

## Configuration

Add a proper description of your image and usage in README.md
