#!/usr/bin/env python3
import os
import subprocess
import sys
import argparse
import json
import time


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
    
    default_code = os.path.expanduser("~/waypoint/code")
    default_code_dir = config.get("code_dir", default_code)
    current_setting = f" (current: {config['code_dir']})" if "code_dir" in config else ""
    prompt = f"Enter code directory path [{default_code_dir}]{current_setting}: "
    code_dir = input(prompt).strip()
    if not code_dir:
        code_dir = default_code_dir
    
    default_secrets = os.path.expanduser("~/waypoint/secrets")
    default_secrets_dir = config.get("secrets_dir", default_secrets)
    current_setting = f" (current: {config['secrets_dir']})" if "secrets_dir" in config else ""
    prompt = f"Enter secrets directory path [{default_secrets_dir}]{current_setting}: "
    secrets_dir = input(prompt).strip()
    if not secrets_dir:
        secrets_dir = default_secrets_dir
    
    os.makedirs(code_dir, exist_ok=True)
    os.makedirs(secrets_dir, exist_ok=True)
    
    config = {
        "code_dir": code_dir,
        "secrets_dir": secrets_dir
    }
    save_config(config)
    print(f"\nConfiguration saved successfully to {CONFIG_FILE}!")


def start() -> None:
    """Start waypoint services using docker-compose."""
    config = load_config()
    
    if not config:
        print("Waypoint is not configured. Running configuration...")
        configure()
        config = load_config()
    
    env = os.environ.copy()
    env["WAYPOINT_CODE_DIR"] = config["code_dir"]
    env["WAYPOINT_SECRETS_DIR"] = config["secrets_dir"]
    
    # TODO: deadcode
    docker_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    try:
        try:
            subprocess.run(
                [
                    "docker", "run", "-it",
                    "-v", f"{config['code_dir']}:/labs",
                    "-v", f"{config['secrets_dir']}:/opt/waypoint/secrets",
                    "-p", "8000:8000",
                    "-p", "3000:3000",
                    "waypoint:v0.0.7",
                    "bash"
                ],
                check=True
            )
        except KeyboardInterrupt:
            print("\nExiting waypoint shell...")
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
    subparsers.add_parser("start", help="Start waypoint services")
    
    args = parser.parse_args()
    
    if args.command == "configure":
        configure()
    elif args.command == "start":
        start()
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main() 