#!/usr/bin/env python3
import argparse
import os
import subprocess
import sys

PRODUCTS = {
    "office-hours-queue": {
        "sha": "524282d029a330b59158e80299e3be23988f1765",
        "node_version": "22",
    },
    "penn-clubs": {
        "sha": "d2e5758f1498b17cd3f20d08c37969d3e8c9c7bd",
        "node_version": "20",
    },
    "penn-mobile": {
        "sha": "b1a8bfa53a35496c972b880f7e3ab9d93845b614",
        "node_version": "22",
    },
    "penn-courses": {
        "sha": "723640b1dbb815877c24bb1bc8b729c15e12c87a",
        "node_version": "22",
    },
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
                check=True,
            )
            print(f"Finished cloning {product}")
        except subprocess.CalledProcessError:
            print(f"Failed to clone {product}")
            sys.exit(1)
    else:
        print(f"Repository {product} already exists, skipping clone")


def clone_and_init_products() -> None:
    """Clone all products from GitHub if they don't exist."""
    for product in PRODUCTS:
        clone_product(product)
        init_product(product)


def init() -> None:
    """Set up waypoint, install dependencies."""
    clone_and_init_products()

    if not os.path.exists(os.path.join(WAYPOINT_DIR, "secrets")):
        print("No secrets found. Skipping...")
        return

    for secret_file in os.listdir(os.path.join(WAYPOINT_DIR, "secrets")):
        if os.path.isfile(os.path.join(WAYPOINT_DIR, "secrets", secret_file)):
            print(f"Loading secrets from: {secret_file}")
            with open(
                os.path.join(WAYPOINT_DIR, "secrets", secret_file),
                "r",
                encoding="utf-8",
            ) as f:
                secret_value = f.read().strip()
                os.environ[secret_file] = secret_value
                if secret_file not in os.environ:
                    print(f"Error: Secret '{secret_file}' not found")
                    sys.exit(1)
    print("Secrets loaded successfully")


def sync_env(product: str) -> None:
    """Sync .env file from product to waypoint."""
    if product not in PRODUCTS:
        print(f"Error: Unknown product '{product}'")
        print(f"Available products: {', '.join(PRODUCTS.keys())}")
        sys.exit(1)

    product_backend_path = os.path.join(CODE_DIR, product, "backend")
    waypoint_product_path = os.path.join(WAYPOINT_DIR, product)

    if not os.path.exists(product_backend_path):
        print(f"Error: Backend directory not found at {product_backend_path}")
        sys.exit(1)

    os.makedirs(waypoint_product_path, exist_ok=True)

    try:
        for file in ["Pipfile", "Pipfile.lock"]:
            src = os.path.join(product_backend_path, file)
            dst = os.path.join(waypoint_product_path, file)

            if not os.path.exists(src):
                print(f"Warning: {file} not found in {product_backend_path}")
                continue

            with open(src, "r", encoding="utf-8") as f_src:
                with open(dst, "w", encoding="utf-8") as f_dst:
                    f_dst.write(f_src.read())
            print(
                f"Copied {file} from {product_backend_path} to {waypoint_product_path}"
            )

        venv_path = os.path.join(waypoint_product_path, "venv")
        if not os.path.exists(venv_path):
            subprocess.run(
                ["uv", "venv", venv_path, "--python", "3.11", "--prompt", product],
                check=True,
            )

        subprocess.run(
            f"cd {waypoint_product_path} && . venv/bin/activate && "
            f"pipenv requirements --dev > requirements.txt && "
            f"uv pip install -r requirements.txt",
            shell=True,
            check=True,
        )
        print(f"Successfully synced environment for {product}")

    except (OSError, subprocess.CalledProcessError) as e:
        print(f"Error syncing environment for {product}: {str(e)}")
        sys.exit(1)


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
    try:
        subprocess.run(
            f"bash -c 'source {venv_path} && cd {backend_path} && python manage.py migrate'",
            shell=True,
            check=True,
        )
        if (product != "penn-mobile" and product != "penn-courses"):
            subprocess.run(
                f"bash -c 'source {venv_path} && cd {backend_path} && python manage.py populate'",
                shell=True,
                check=True,
            )
    except subprocess.CalledProcessError:
        print(
            f"Failed to run manage.py commands for {product}, did you run `waypoint services`?"
        )
        sys.exit(1)
    # init yarn
    if (product != "penn-courses"):
        subprocess.run(
            f"bash -c 'cd {os.path.join(CODE_DIR, product, 'frontend')} && yarn install'",
            shell=True,
            check=True,
        )
    else:
        subprocess.run(
            f"bash -c 'cd {os.path.join(CODE_DIR, product, 'frontend')} && yarn'",
            shell=True,
            check=True,
        )
        # Yarn install in subfolders, [alert|plan|review]
        for folder in ["alert", "plan", "review"]:
            subprocess.run(
                f"bash -c 'cd {os.path.join(CODE_DIR, product, 'frontend', folder)} && yarn'",
                shell=True,
                check=True,
            )
    
    if product == "penn-courses":
        # Check /opt/waypoint/secrets for sql file "pcx_test.sql"
        sql_file = os.path.join(WAYPOINT_DIR, "secrets", "pcx_test.sql")
        reset_courses_file = os.path.join(WAYPOINT_DIR, "cli", "reset_courses.sql")
        if os.path.exists(sql_file):
            try:
                password = "postgres"
                # Run the psql command with the password
                # Reset Courses Related Tables
                subprocess.run(
                    f"PGPASSWORD={password} psql -h localhost -d postgres -U penn-courses -f  {reset_courses_file}",
                    shell=True,
                    check=True,
                )

                print("Successfully reset courses related tables")
                # Add data
                subprocess.run(
                    f"PGPASSWORD={password} psql -h localhost -d postgres -U penn-courses -f {sql_file}",
                    shell=True,
                    check=True,
                )
                print("Successfully ran pcx_tsxt.sql")
            except subprocess.CalledProcessError:
                print("Failed to run pcx_test.sql, check if it exists in your secrets folder")
                exit(1)
        else:
            print("pcx_test.sql not found in secrets folder, skipping")
        

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
        print(
            f"Product '{product}' is not initialized. Run 'waypoint init {product}' first."
        )
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
    code_path = os.path.join(CODE_DIR, product)
    if not no_vsc:
        try:
            subprocess.run(["code", "--new-window", "."], cwd=code_path)
        except FileNotFoundError:
            print(
                "VSCode not found. You may not be in a dev container. Skipping opening VSCode."
            )
    print(f"Switched to {product}")


def start_services(mode: str = "start") -> None:
    """Start background services"""
    if mode == "start" or mode == "":
        try:
            subprocess.run(["/opt/waypoint/database-init"], check=True)
            print("PostgreSQL and Redis service started")
        except subprocess.CalledProcessError:
            print("Failed to start PostgreSQL service")
            sys.exit(1)
    elif mode == "stop":
        try:
            subprocess.run(["service", "postgresql", "stop"], check=True)
            subprocess.run(["redis-cli", "shutdown"], check=True)
            print("PostgreSQL service stopped")
        except subprocess.CalledProcessError:
            print("Failed to stop PostgreSQL or Redis service")
            sys.exit(1)
    elif mode == "status":
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

    current_link_points_to = (
        os.readlink(current_link) if os.path.islink(current_link) else None
    )
    product_name = (
        os.path.basename(current_link_points_to) if current_link_points_to else None
    )

    if not product_name:
        print("No product selected. Use 'waypoint switch <product>' first.")
        sys.exit(1)

    initalized = os.path.exists(current_link + "/.initialized")
    if not initalized:
        print(
            f"Product '{product_name}' is not initialized. Run 'waypoint init {product_name}' first."
        )
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
    parser = argparse.ArgumentParser(
        description="Waypoint development environment manager"
    )
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")

    init_parser = subparsers.add_parser(
        "init",
        help="""
-------------Initialize a product environment or all products-----------------

Clones repos, installs dependencies, runs manage.py commands, and yarn install.
If no product is specified, it will initialize all products.

Example: waypoint init office-hours-queue
------------------------------------------------------------------------------
""",
    )
    init_parser.add_argument(
        "product", help="Product to initialize", nargs="?", default=None
    )

    switch_parser = subparsers.add_parser(
        "switch",
        help="""
-------------Switch to a product environment-------------
Starts the uv virtual enviroment assosiated with the product
Opens the product in VSCode if in a dev container.
You can also specify --no-vsc to not open VSCode.
                                        
Example: waypoint switch office-hours-queue --no-vsc

---------------------------------------------------------""",
    )
    switch_parser.add_argument(
        "product", help="Product to switch to, options: " + ", ".join(PRODUCTS.keys())
    )
    switch_parser.add_argument(
        "--no-vsc", action="store_true", help="Do not open VSCode on switch"
    )

    subparsers.add_parser(
        "start",
        help="""
-------------Start both the backend and frontend of the current development environment-------------
Runs `python manage.py runserver` and `yarn dev` in the appropriate directories.
Note: Must be in a dev container to run this command.

Example: waypoint start

----------------------------------------------------------------------------------------------------
                        """,
    )

    subparsers.add_parser(
        "backend",
        help="""
-------------Start current product backend-------------------
Runs `python manage.py runserver` in the appropriate directory.
Note: Must be in a dev container to run this command.

Example: waypoint backend   

-------------------------------------------------------------
                                """,
    )
    subparsers.add_parser(
        "frontend",
        help="""
-------------Start current product frontend-------------------
Runs `yarn dev` in the appropriate directory.
Note: Must be in a dev container to run this command.

Example: waypoint frontend

-------------------------------------------------------------
        """
    )

    services_parser = subparsers.add_parser(
        "services",
        help="""
-------------Manage background services----------------------
Starts, stop or chec the status of the PostgreSQL and Redis services.
If no mode is specified, it will start the services.

Example: waypoint services start

-------------------------------------------------------------
""",
    )
    services_parser.add_argument(
        "mode",
        help="Start, stop, or get the status of background services",
        choices=["start", "stop", "status"],
        nargs="?",
        const="start",
        default="start",
    )

    sync_parser = subparsers.add_parser("sync", help="Sync environment variables")
    sync_parser.add_argument(
        "product", help="Product to sync environment variables for"
    )

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
    elif args.command == "sync":
        sync_env(args.product)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
