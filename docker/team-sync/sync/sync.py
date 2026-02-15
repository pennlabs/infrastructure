#!/usr/bin/env python
import importlib.util
import logging
import os
import pkgutil
import yaml

from github import Auth, Github

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("sync")


def get_user_info():
    """
    Create a dictionary of GitHub usernames to PennKeys and emails.
    """

    roster_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "roster.yaml")
    
    with open(roster_path, 'r') as f:
        roster_data = yaml.safe_load(f)
    
    data = {}

    for member in roster_data["roster"]:
        github_id = member['github'].lower()
        pennkey = member['pennkey'].lower()
        email = member['email'].lower()
        data[github_id] = {"pennkey": pennkey, "email": email}

    return data


def run():
    g = Github(auth=Auth.Token(os.getenv("GITHUB_TOKEN")))

    # Generate dictionary of teams
    logger.info("Fetching teams from pennlabs GitHub organization...")
    teams = {}
    for team in g.get_organization("pennlabs").get_teams():
        if team.name == "Alumni":  # Found an Alumni Team
            teams.setdefault("alumni", []).append(team)
        elif team.name == "Directors":  # Found a Director Team
            teams.setdefault("directors", []).append(team)
        elif team.slug.endswith("-leads"):  # Found a Lead Team
            teams.setdefault("leads", []).append(team)
        else:  # Found a Regular Team
            teams.setdefault("members", []).append(team)

    for category, team_list in teams.items():
        team_names = [t.name for t in team_list]
        logger.info("Found %d %s team(s): %s", len(team_list), category, ", ".join(team_names))

    # Generate dictionary of GitHub usernames to PennKey
    users = get_user_info()
    logger.info("Loaded %d user(s) from roster", len(users))

    # Dynamically find each module and run its sync method
    location = os.path.join(os.path.dirname(os.path.abspath(__file__)), "modules")
    for finder, name, _ in pkgutil.walk_packages([location]):
        try:
            logger.info("=" * 50)
            logger.info("Running module: %s", name)
            logger.info("=" * 50)
            spec = finder.find_spec(name)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            module.sync(teams, users)
            logger.info("Module '%s' completed successfully", name)
        except (AttributeError, TypeError) as e:
            logger.error("Could not execute module '%s': %s", name, e)


if __name__ == "__main__":
    run()
