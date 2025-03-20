#!/usr/bin/env python3
import os
import subprocess
import sys
import argparse
import json


CONFIG_FILE = os.path.expanduser("~/.waypoint/config.json")
IMAGE_NAME = "pennlabs/waypoint"
CONTAINER_NAME = "waypoint-1"

def load_config() -> dict:
    """Load waypoint configuration from file."""
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_config(config: dict) -> None:
    """Save waypoint configuration to file."""
    os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)


def configure() -> None:
    """Configure waypoint directories."""
    print("Waypoint Configuration")
    print("=====================")

    config = load_config()

    default_config = os.path.expanduser("~/waypoint/config")
    default_config_dir = config.get("config_dir", default_config)
    current_setting = (
        f" (current: {config['config_dir']})" if "config_dir" in config else ""
    )
    prompt = f"Enter config directory path [{default_config_dir}]{current_setting}: "
    config_dir = input(prompt).strip()
    if not config_dir:
        config_dir = default_config_dir

    default_code = os.path.expanduser("~/waypoint/code")
    default_code_dir = config.get("code_dir", default_code)
    current_setting = (
        f" (current: {config['code_dir']})" if "code_dir" in config else ""
    )
    prompt = f"Enter code directory path [{default_code_dir}]{current_setting}: "
    code_dir = input(prompt).strip()
    if not code_dir:
        code_dir = default_code_dir

    default_secrets = os.path.expanduser("~/waypoint/secrets")
    default_secrets_dir = config.get("secrets_dir", default_secrets)
    current_setting = (
        f" (current: {config['secrets_dir']})" if "secrets_dir" in config else ""
    )
    prompt = f"Enter secrets directory path [{default_secrets_dir}]{current_setting}: "
    secrets_dir = input(prompt).strip()
    if not secrets_dir:
        secrets_dir = default_secrets_dir

    default_editor = "code"
    default_editor_type = config.get("editor_type", default_editor)
    current_setting = (
        f" (current: {config['editor_type']})" if "editor_type" in config else ""
    )
    prompt = (
        f"Enter editor type (code/cursor) [{default_editor_type}]{current_setting}: "
    )
    editor_type = input(prompt).strip().lower()
    if not editor_type:
        editor_type = default_editor_type
    elif editor_type not in ["code", "cursor"]:
        print("Invalid editor type. Using default 'code'")
        editor_type = default_editor

    os.makedirs(config_dir, exist_ok=True)
    os.makedirs(code_dir, exist_ok=True)
    os.makedirs(secrets_dir, exist_ok=True)

    config = {
        "config_dir": config_dir,
        "code_dir": code_dir,
        "secrets_dir": secrets_dir,
        "editor_type": editor_type,
    }
    save_config(config)
    print(f"\nConfiguration saved successfully to {CONFIG_FILE}!")


def start(rebuild: bool = False) -> None:
    """Start waypoint services using docker-compose."""
    config = load_config()

    if not config:
        print("Waypoint is not configured. Running configuration...")
        configure()
        config = load_config()

    env = os.environ.copy()
    env["WAYPOINT_CONFIG_DIR"] = config["config_dir"]
    env["WAYPOINT_CODE_DIR"] = config["code_dir"]
    env["WAYPOINT_SECRETS_DIR"] = config["secrets_dir"]

    result = subprocess.run(
        ["docker", "images", "-q", IMAGE_NAME],
        capture_output=True,
        text=True,
        check=True,
    )
    image_found = result.stdout.strip()

    if not image_found or rebuild:
        if not image_found:
            print(f"Docker image {IMAGE_NAME} not found. Pulling from pennlabs/waypoint...")
        else:
            print(f"--rebuild flag detected. Pulling latest pennlabs/waypoint...")
        try:
            subprocess.run(["docker", "pull", IMAGE_NAME], check=True)
        except subprocess.CalledProcessError:
            print("\nError: Failed to pull waypoint container")
            sys.exit(1)

    ssh_dir = os.path.join(config['config_dir'], '.ssh')
    gnupg_dir = os.path.join(config['config_dir'], '.gnupg')

    # Check if the ssh and gnupg directories exist, and create them if they don't
    if not os.path.exists(ssh_dir):
        os.makedirs(ssh_dir)
    if not os.path.exists(gnupg_dir):
        os.makedirs(gnupg_dir)
    
    waypoint_state = is_waypoint_running()
    if waypoint_state == 2: 
            print(f"Waypoint is already running. Use 'waypoint-client spawn' to open a new shell.")
            sys.exit(1)
    elif waypoint_state == 1:
            try:
                subprocess.run(["docker", "start", "-ai", CONTAINER_NAME], check=True)
            except subprocess.CalledProcessError:
                print("\nError: Failed to start waypoint container")
                sys.exit(1)
    else:
        try:
            try:
                subprocess.run(
                    [
                        "docker",
                        "run",
                        "-it",
                        "-v",
                        f"{config['config_dir']}/.ssh:/root/.ssh",
                        "-v",
                        f"{config['config_dir']}/.gnupg:/root/.gnupg",
                        "-v",
                        f"{config['code_dir']}:/labs",
                        "-v",
                        f"{config['secrets_dir']}:/opt/waypoint/secrets",
                        "-p",
                        "8000:8000",
                        "-p",
                        "3000:3000",
                        "--name",
                        CONTAINER_NAME,
                        IMAGE_NAME,
                        "bash"
                    ],
                    check=True,
                )
            except KeyboardInterrupt:
                print("\nExiting waypoint shell...")
                sys.exit(0)
        except subprocess.CalledProcessError:
            print("\nError: Failed to start waypoint container")
            sys.exit(1)

        except KeyboardInterrupt:
            print("\nStartup interrupted.")
            sys.exit(1)

def is_waypoint_running() -> int:
    """Check the state of the waypoint container. 
    Returns 0 if the container does not exist, 
    1 if the container exists but is not running, and 2 if the container is running."""
    result = subprocess.run(
        ["docker", "inspect", "--format", "{{.State.Running}}", CONTAINER_NAME],
        capture_output=True, text=True, check=False
    )
    
    if result.returncode != 0:
        # Container does not exist
        return 0
    
    if result.stdout.strip() == "true":
        # Container is running
        return 2
    
    # Container exists but is not running
    return 1


def spawn() -> None:
    """Spawn a new bash shell in the waypoint container."""
    if is_waypoint_running() == 2:
        print("Waypoint contianer found, spawning new bash shell...")
        subprocess.run(["docker", "exec", "-it", CONTAINER_NAME, "bash"], check=False)
    else:
        print("Error: Waypoint container not found, is it running?")
        sys.exit(1)

def main() -> None:
    """Main entry point for waypoint client."""
    parser = argparse.ArgumentParser(description="Waypoint Client")
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")

    subparsers.add_parser("configure", help="Configure waypoint directories")
    start_parser = subparsers.add_parser("start", help="Start waypoint services")
    start_parser.add_argument(
        "--rebuild",
        action="store_true",
        help="Rebuild waypoint image to be up to date. Note this will delete the existing image and start from scratch, but your code and secrets will be preserved.",
    )

    subparsers.add_parser("spawn", help="Spawn a new bash shell in the waypoint container")

    args = parser.parse_args()

    if args.command == "configure":
        configure()
    elif args.command == "start":
        if args.rebuild:
            if (
                input(
                    "Are you sure you want to rebuild the waypoint image? (y/n): "
                ).lower()
                != "y"
            ):
                print("Aborting...")
                sys.exit(1)
            start(rebuild=True)
        else:
            start()
    elif args.command == "spawn":
        spawn()
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
