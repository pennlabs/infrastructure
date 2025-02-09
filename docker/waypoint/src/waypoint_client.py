#!/usr/bin/env python3
import os
import subprocess
import sys
import argparse
import json


CONFIG_FILE = os.path.expanduser("~/.waypoint/config.json")


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
    editor_type = config.get("editor_type", None)

    image_name = "waypoint"
    result = subprocess.run(
        ["docker", "images", "-q", image_name],
        capture_output=True,
        text=True,
        check=True,
    )
    image_found = result.stdout.strip()

    if not image_found or rebuild:
        if not image_found:
            print(f"Docker image {image_name} not found. Building...")
        else:
            print(f"--rebuild flag detected. Rebuilding...")
        try:
            subprocess.run(["docker", "build", "-t", image_name, "."], check=True)
        except subprocess.CalledProcessError:
            print("\nError: Failed to build waypoint container")
            sys.exit(1)

    # TODO: Currently not working in detecting cursor
    if editor_type is not None:
        result = subprocess.run(
            ["which", editor_type], capture_output=True, text=True, check=False
        )
        editor_exists = result.returncode == 0 or "aliased to" in result.stdout
        if editor_exists:
            print(f"Editor {editor_type} found. Opening {editor_type}...")
        else:
            print(f"Editor {editor_type} not found. Opening default editor...")
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
                    image_name,
                    (
                        "bash"
                        if not editor_exists
                        else f"bash -c '{editor_type} --folder-uri vscode-remote://dev-container/{config['code_dir']}'"
                    ),
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
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
