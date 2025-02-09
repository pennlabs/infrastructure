#!/usr/bin/env python3
import argparse
import os
import subprocess
import sys

PRODUCTS = {
    "office-hours-queue": 
    {
        "sha": "524282d029a330b59158e80299e3be23988f1765",
        "node_version": "22"
    },
    "penn-clubs": {
        "sha": "d2e5758f1498b17cd3f20d08c37969d3e8c9c7bd",
        "node_version": "20"
    },
    "penn-mobile": {
        "sha": "b1a8bfa53a35496c972b880f7e3ab9d93845b614",
        "node_version": "22"
    },
    "penn-courses": {
        "sha": "723640b1dbb815877c24bb1bc8b729c15e12c87a",
        "node_version": "22"
    }
}

WAYPOINT_DIR = "/opt/waypoint"
CODE_DIR = "/labs"

def clone_product(product: str) -> None:
    """Clone a product from GitHub if it doesn't exist."""
    product_path = os.path.join(CODE_DIR, product)
    if not os.path.exists(product_path):
        print(f"Cloning {product}...")
        try:
            subprocess.run(
                ["git", "clone", f"https://github.com/pennlabs/{product}.git"],
                cwd=CODE_DIR,
                check=True
            )
            print(f"Finished cloning {product}")
        except subprocess.CalledProcessError:
            print(f"Failed to clone {product}")
            sys.exit(1)
    else:
        print(f"Repository {product} already exists, skipping clone")


def clone_products() -> None:
    """Clone all products from GitHub if they don't exist."""
    for product in PRODUCTS:
        clone_product(product)

def init() -> None:
    """Set up waypoint, install dependencies."""
    clone_products()
    
    if not os.path.exists(os.path.join(WAYPOINT_DIR, "secrets")):
        print("No secrets found. Skipping...")
        return
    
    for secret_file in os.listdir(os.path.join(WAYPOINT_DIR, "secrets")):
        if os.path.isfile(os.path.join(WAYPOINT_DIR, "secrets", secret_file)):
            print(f"Loading secrets from: {secret_file}")
            with open(os.path.join(WAYPOINT_DIR, "secrets", secret_file), "r", encoding="utf-8") as f:
                secret_value = f.read().strip()
                os.environ[secret_file] = secret_value
                if secret_file not in os.environ:
                    print(f"Error: Secret '{secret_file}' not found")
                    sys.exit(1)
    print("Secrets loaded successfully")

def init_product(product: str) -> None:
    """Initialize a product environment"""
    if product not in PRODUCTS:
        print(f"Error: Unknown product '{product}'")
        print(f"Available products: {', '.join(PRODUCTS.keys())}")
        sys.exit(1)

    clone_product(product)
    product_path = os.path.join(WAYPOINT_DIR, product)
    backend_path = os.path.join(CODE_DIR, product, "backend")
    initalized = os.path.exists(product_path + "/.initialized")

    if initalized:
        print(f"Product '{product}' is already initialized.")
        sys.exit(1)
    
    # Run manage.py commands in product venv
    venv_path = os.path.join(product_path, "venv", "bin", "activate")
    subprocess.run(f"bash -c 'source {venv_path} && cd {backend_path} && python manage.py migrate'", shell=True, check=True)
    subprocess.run(f"bash -c 'source {venv_path} && cd {backend_path} && python manage.py populate'", shell=True, check=True)
    # init yarn
    subprocess.run(f"bash -c 'cd {os.path.join(CODE_DIR, product, 'frontend')} && yarn install'", shell=True, check=True)

    # Make .initialized file
    with open(os.path.join(product_path, ".initialized"), "w") as f:
        f.write("")
    
    print(f"Product '{product}' initialized successfully.")


def switch_product(product: str, no_vsc: bool) -> None:
    """Switch to a different product environment"""
    if product not in PRODUCTS:
        print(f"Error: Unknown product '{product}'")
        print(f"Available products: {', '.join(PRODUCTS.keys())}")
        sys.exit(1)

    product_path = os.path.join(WAYPOINT_DIR, product)

    initalized = os.path.exists(product_path + "/.initialized")

    if not initalized:
        print(f"Product '{product}' is not initialized. Run 'waypoint init {product}' first.")
        sys.exit(1)

    # Create symlink to current
    current_link = os.path.join(WAYPOINT_DIR, "current")
    if os.path.exists(current_link):
        os.remove(current_link)
    os.symlink(product_path, current_link)
    
    # Switch node versions with nvm
    # node_version = PRODUCTS[product].get("node_version", 22)
    # subprocess.run(f"bash -c '. /usr/local/nvm/nvm.sh && nvm use {node_version}'", shell=True, check=True)
   
    # Switch VSCode window
    code_path = os.path.join(code_path, product)
    if not no_vsc:
        try:
            subprocess.run(['code', '--new-window', '.'], cwd=code_path)
        except FileNotFoundError:
            print("VSCode not found. You may not be in a dev container. Skipping opening VSCode.")
    print(f"Switched to {product}")


def start_services(mode: str = "start") -> None:
    """Start background services"""
    if (mode == "start" or mode == ""):
        try:
            subprocess.run(["/opt/waypoint/database-init"], check=True)
            print("PostgreSQL and Redis service started")
        except subprocess.CalledProcessError:
            print("Failed to start PostgreSQL service")
            sys.exit(1)
    elif (mode == "stop"):
        try:
            subprocess.run(["service", "postgresql", "stop"], check=True)
            subprocess.run(["redis-cli", "shutdown"], check=True)
            print("PostgreSQL service stopped")
        except subprocess.CalledProcessError:
            print("Failed to stop PostgreSQL or Redis service")
            sys.exit(1)
    elif (mode == "status"):
        try:
            subprocess.run(["service", "postgresql", "status"], check=True)
        except subprocess.CalledProcessError:
            print("PostgreSQL is not running")
        try:
            subprocess.run(["redis-cli", "ping"], check=True)
        except subprocess.CalledProcessError:
            print("Redis is not running")
            sys.exit(1)
        print("PostgrestgreSQL and Redis are running")

def start_development(mode: str) -> None:
    """Start development environment"""
    current_link = os.path.join(WAYPOINT_DIR, "current")
    if not os.path.exists(current_link):
        print("No product selected. Use 'waypoint switch <product>' first.")
        sys.exit(1)

    current_link_points_to = os.readlink(current_link) if os.path.islink(current_link) else None
    product_name = os.path.basename(current_link_points_to) if current_link_points_to else None

    if not product_name:
        print("No product selected. Use 'waypoint switch <product>' first.")
        sys.exit(1)
    
    initalized = os.path.exists(current_link + "/.initialized")
    if not initalized:
        print(f"Product '{product_name}' is not initialized. Run 'waypoint init {product_name}' first.")
        sys.exit(1)
    
    product_code_path = os.path.join(CODE_DIR, product_name)
   
    if mode == "backend":
        start_cmd = f"bash -c 'source {current_link}/venv/bin/activate && cd {product_code_path}/backend && python manage.py runserver 0.0.0.0:8000'"
    elif mode == "frontend":
        start_cmd = f"bash -c 'cd {product_code_path}/frontend && yarn dev'"
    else:
        start_cmd = f"bash -c 'source {current_link}/venv/bin/activate && cd {product_code_path}/backend && python manage.py runserver  0.0.0.0:8000 && cd {product_code_path}/frontend && yarn dev'"
    
    try:
        subprocess.run(start_cmd, shell=True, check=True)
    except subprocess.CalledProcessError:
        print("Failed to start development server")
        sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(description="Waypoint development environment manager")
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")

    init_parser = subparsers.add_parser("init", help="Initialize a product environment")
    init_parser.add_argument("product", help="Product to initialize", nargs="?", default=None)

    switch_parser = subparsers.add_parser("switch", help="Switch to a different product")
    switch_parser.add_argument("product", help="Product to switch to")
    switch_parser.add_argument('--no-vsc', action='store_true', help='Do not open VSCode on switch')

    subparsers.add_parser("start", help="Start development environment")

    subparsers.add_parser("backend", help="Start current product backend")
    subparsers.add_parser("frontend", help="Start current product frontend")

    services_parser = subparsers.add_parser("services", help="Start background services")
    services_parser.add_argument("mode", help="start, stop, or status of services", 
                                 choices=["start", "stop", "status"], nargs="?", const="start", default="start")

    args = parser.parse_args()

    if args.command == "switch":
        switch_product(args.product, args.no_vsc)
    elif args.command == "start":
        start_development("all")
    elif args.command == "services":
        start_services(args.mode)
    elif args.command == "init":
        if args.product:
            init_product(args.product)
        else:
            init()
    elif args.command == "backend":
        start_development("backend")
    elif args.command == "frontend":
        start_development("frontend")
    else:
        parser.print_help()
        sys.exit(1)

if __name__ == "__main__":
    main()
