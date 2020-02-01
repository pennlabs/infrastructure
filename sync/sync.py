#!/usr/bin/env python
import os
import pkgutil

from github import Github


def run():
    g = Github(os.getenv("GITHUB_TOKEN"))

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

    # Dynamically find each module and run its sync method
    location = os.path.join(os.path.dirname(os.path.abspath(__file__)), "modules")
    for finder, name, _ in pkgutil.walk_packages([location]):
        try:
            module = finder.find_module(name).load_module(name)
            module.sync(teams)
        except Exception as e:
            print(f"Could not load module: {name}. The following exception occurred: {e}")


if __name__ == "__main__":
    run()
