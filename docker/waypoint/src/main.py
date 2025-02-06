#!/usr/bin/env python3
import argparse
import os
import subprocess
import sys

PRODUCTS = {
    "office-hours-queue": "524282d029a330b59158e80299e3be23988f1765",
    "penn-clubs": "d2e5758f1498b17cd3f20d08c37969d3e8c9c7bd",
    "penn-mobile": "b1a8bfa53a35496c972b880f7e3ab9d93845b614",
    "penn-courses": "723640b1dbb815877c24bb1bc8b729c15e12c87a"
}

WAYPOINT_DIR = "/opt/waypoint"

def init_product(product: str) -> None:
    """Initialize a product environment"""
    if product not in PRODUCTS:
        print(f"Error: Unknown product '{product}'")
        print(f"Available products: {', '.join(PRODUCTS.keys())}")
        sys.exit(1)

    product_path = os.path.join(WAYPOINT_DIR, product)
    if os.path.exists(product_path):
        print(f"Product '{product}' is already initialized")
        return

    print(f"Initializing {product}...")
    
    repo_url = f"https://github.com/pennlabs/{product}.git"
    subprocess.run(["git", "clone", repo_url, product_path], check=True)
    
    subprocess.run(["python3", "-m", "venv", f"{product_path}/venv"], check=True)
    
    print(f"Successfully initialized {product}")


def switch_product(product: str) -> None:
    """Switch to a different product environment"""
    if product not in PRODUCTS:
        print(f"Error: Unknown product '{product}'")
        print(f"Available products: {', '.join(PRODUCTS.keys())}")
        sys.exit(1)

    product_path = os.path.join(WAYPOINT_DIR, product)
    if not os.path.exists(product_path):
        print(f"Product '{product}' is not initialized. Run 'waypoint init {product}' first.")
        sys.exit(1)

    # Create symlink to current
    current_link = os.path.join(WAYPOINT_DIR, "current")
    if os.path.exists(current_link):
        os.remove(current_link)
    os.symlink(product_path, current_link)
    
    print(f"Switched to {product}")


def start_services() -> None:
    """Start background services"""
    # Start PostgreSQL service
    try:
        subprocess.run(["sudo", "systemctl", "start", "postgresql"], check=True)
        print("PostgreSQL service started")
    except subprocess.CalledProcessError:
        print("Failed to start PostgreSQL service")
        sys.exit(1)


def start_development() -> None:
    """Start development environment"""
    current_link = os.path.join(WAYPOINT_DIR, "current")
    if not os.path.exists(current_link):
        print("No product selected. Use 'waypoint switch <product>' first.")
        sys.exit(1)

    # Activate virtual environment and start development server
    venv_activate = f". {current_link}/venv/bin/activate"
    start_cmd = f"{venv_activate} && cd {current_link}/backend && python manage.py runserver"
    
    try:
        subprocess.run(start_cmd, shell=True, check=True)
    except subprocess.CalledProcessError:
        print("Failed to start development server")
        sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(description="Waypoint development environment manager")
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")

    init_parser = subparsers.add_parser("init", help="Initialize a product environment")
    init_parser.add_argument("product", help="Product to initialize")

    switch_parser = subparsers.add_parser("switch", help="Switch to a different product")
    switch_parser.add_argument("product", help="Product to switch to")

    subparsers.add_parser("start", help="Start development environment")

    subparsers.add_parser("services", help="Start background services")

    args = parser.parse_args()

    if args.command == "init":
        init_product(args.product)
    elif args.command == "switch":
        switch_product(args.product)
    elif args.command == "start":
        start_development()
    elif args.command == "services":
        start_services()
    else:
        parser.print_help()
        sys.exit(1)

if __name__ == "__main__":
    main()
