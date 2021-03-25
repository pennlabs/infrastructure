#!/usr/bin/env python
import os
import pkgutil

from airtable import Airtable
from github import Github


AIRTABLE_BASE_KEY = os.environ.get("AIRTABLE_BASE_KEY")
AIRTABLE_API_KEY = os.environ.get("AIRTABLE_API_KEY")
airtable = Airtable(AIRTABLE_BASE_KEY, "Roster", AIRTABLE_API_KEY)


def map_gh_pennkeys():
    """
    Create a dictionary of GitHub usernames to PennKeys.
    """
    roster = airtable.get_all(view="Platform Sync", fields=["Github", "PennKey"])
    pennkeys = {}
    for record in roster:
        fields = record["fields"]
        if "Github" in fields and "PennKey" in fields:
            github_url = fields["Github"].lower()
            pennkey = fields["PennKey"].lower()
            if github_url.startswith("https://github.com/"):
                github_id = github_url.split("/")[3]
                pennkeys[github_id] = pennkey
    return pennkeys


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

    # Generate dictionary of GitHub usernames to PennKey
    pennkeys = map_gh_pennkeys()

    # Dynamically find each module and run its sync method
    location = os.path.join(os.path.dirname(os.path.abspath(__file__)), "modules")
    for finder, name, _ in pkgutil.walk_packages([location]):
        try:
            module = finder.find_module(name).load_module(name)
            module.sync(teams, pennkeys)
        except (AttributeError, TypeError) as e:
            print(f"Could not execute module '{name}'. The following exception occurred: {e}")


if __name__ == "__main__":
    run()
