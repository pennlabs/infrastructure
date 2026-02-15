#!/usr/bin/env python
import importlib.util
import os
import pkgutil
import yaml

from github import Auth, Github

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

    # Generate dictionary of GitHub usernames to PennKey
    users = get_user_info()

    # Dynamically find each module and run its sync method
    location = os.path.join(os.path.dirname(os.path.abspath(__file__)), "modules")
    for finder, name, _ in pkgutil.walk_packages([location]):
        try:
            spec = finder.find_spec(name)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            module.sync(teams, users)
        except (AttributeError, TypeError) as e:
            print(f"Could not execute module '{name}'. The following exception occurred: {e}")


if __name__ == "__main__":
    run()
