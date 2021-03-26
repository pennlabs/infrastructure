import os

import requests


PLATFORM_API_KEY = os.environ.get("PLATFORM_API_KEY", "")


def sync(teams, users):
    """
    Sync team leads from GitHub to admin permissions on platform
    """
    # Dictionary of pennkey to list of admin permissions
    content = {}
    team_slugs = []

    # Team Leads are admins of their products
    for team in teams["leads"]:
        team_slug = team.slug[:-6]  # Trim -leads
        slug = f"{team_slug.replace('-', '_')}_admin"
        team_slugs.append(slug)
        for member in team.get_members():
            gh_username = member.login.lower()
            pennkey = users.get(gh_username, {}).get("pennkey", None)
            if pennkey:
                content.setdefault(pennkey, []).append(slug)
                # If user is a lead of clubs, also make h@p admin
                if slug == "penn_clubs_admin":
                    content[pennkey].append("hub_admin")

    # Directors are admins on all products
    for team in teams["directors"]:
        for member in team.get_members():
            gh_username = member.login.lower()
            pennkey = users.get(gh_username, {}).get("pennkey", None)
            if pennkey:
                content[pennkey] = team_slugs

    headers = {"Authorization": f"Api-Key {PLATFORM_API_KEY}"}
    requests.post(
        "https://platform.pennlabs.org/accounts/productadmin/", json=content, headers=headers
    )
    return
