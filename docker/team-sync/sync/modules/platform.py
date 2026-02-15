import logging
import os

import requests

logger = logging.getLogger("sync.platform")

PLATFORM_API_KEY = os.environ.get("PLATFORM_API_KEY", "")


def sync(teams, users):
    """
    Sync team leads from GitHub to admin permissions on platform
    """
    # Dictionary of pennkey to list of admin permissions
    content = {}
    # Hub@Penn needs to be pre-populated
    team_slugs = ["hub_admin"]

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
                logger.info("Granting %s (%s) -> %s", pennkey, gh_username, slug)
                # If user is a lead of clubs, also make h@p admin
                if slug == "penn_clubs_admin":
                    content[pennkey].append("hub_admin")
                    logger.info("Granting %s (%s) -> hub_admin (clubs lead)", pennkey, gh_username)
            else:
                logger.warning("Skipping %s (not found in roster)", gh_username)

    # Directors are admins on all products
    for team in teams["directors"]:
        for member in team.get_members():
            gh_username = member.login.lower()
            pennkey = users.get(gh_username, {}).get("pennkey", None)
            if pennkey:
                content[pennkey] = team_slugs
                logger.info("Granting %s (%s) -> all admin roles (director)", pennkey, gh_username)
            else:
                logger.warning("Skipping director %s (not found in roster)", gh_username)

    logger.info("Syncing %d user(s) with admin permissions to platform...", len(content))
    headers = {"Authorization": f"Api-Key {PLATFORM_API_KEY}"}
    res = requests.post(
        "https://platform.pennlabs.org/accounts/productadmin/", json=content, headers=headers
    )
    logger.info("Platform API responded with status %d", res.status_code)
    return
