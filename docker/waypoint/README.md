# Waypoint

A development environment manager for Penn Labs products.

## Installation

### Set-up

To get started, install `waypoint-client` on your local machine by running:

```bash
curl -sSL https://raw.githubusercontent.com/pennlabs/infrastructure/refs/heads/add-waypoint/docker/waypoint/install.sh | sudo bash
```

Next, configure `waypoint-client`:

```bash
waypoint-client configure
```

This setup ensures your code, secrets, and config files persist even if the container is rebuilt or stopped.

To start developing, run:

```bash
waypoint-client start
```

### Developing on a Waypoint Container

On the first boot, the waypoint will build the image.

1. [Install the VSCode Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension.
2. Select `Dev containers: attach to a running container`. (<kbd>Command</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> on Mac)

Then, execute the following commands:

- Start background services (e.g., databases):

  ```bash
  waypoint services
  ```

- Initialize environments:

  ```bash
  waypoint init
  ```

  or

  ```bash
  waypoint init [product]
  ```

- Switch between products:

  ```bash
  waypoint switch [product]
  ```

Now, you are ready to start coding. Treat the waypoint as a VM; you can make changes, set up git, etc. However, remember that updates to the waypoint will erase any changes not made in `/labs`, which is mounted to your local machine based on your initial configuration.

Mounts:

- **Code mount**: Your code is mounted so you can access it locally.
- **Secret mount**: A directory is used as a secret mount, and all files are loaded in with `source` as secrets.

## Waypoint Commands

### `waypoint-client` CLI

The waypoint-client CLI is for your local machine.

- `waypoint-client configure` to set up your waypoint-client and set the location for your secrets and code to be stored on your local machine. These will be mounted into the waypoint dev machine.
- `waypoint-client start` to start the docker image and begin coding. After running, use VSCode dev containers to connect to the waypoint.

### `waypoint` CLI

The waypoint CLI is for your waypoint dev machine.

- `waypoint services (start/stop/status)` to start, stop, or check the status of background services, such as PostgreSQL and Redis.
  - Defaults to `start`
- `waypoint init (product)` to set up initial environments. This will clone corresponding repositories to `/labs/[product]`, migrate and populate the backend, and install frontend packages with `yarn`.
  - You may omit the product name to initialize all products (recommended)
- `waypoint switch [product]` to switch environments. This will attempt to switch to a new VSCode window if you are using waypoint in a dev container

The following commands are done only in a product environment. (You must switch to some product for these to work)

- `waypoint sync [product]` refreshes backend dependencies for a particular product to be up to date to what the container currently specifies.
- `waypoint backend` to start the backend for your current product
- `waypoint frontend` to start the frontend for your current product

- Initialize a product environment:

```bash
waypoint init (product)
```

- Switch between products:

```bash
waypoint switch [product]
```

- Start development server:

```bash
waypoint start
```

- Start background services:

```bash
waypoint services
```
