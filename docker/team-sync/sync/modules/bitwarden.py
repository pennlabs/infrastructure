import os

import requests


def buildURL(path):
    BITWARDEN_URL = os.environ.get("BITWARDEN_URL")
    return f"{BITWARDEN_URL}{path}"


def sync(teams):
    """
    Get users + assigned teams from GH
    Use Airtable API to match GH usernames with school emails https://github.com/gtalarico/airtable-python-wrapper
    Make requests to bitwarden to create users, ensure 2FA is configured, and grant access to organizations
    Request session:
    POST /admin (token: admin password) [this sets admin cookie]
    GET /admin/users/
    """

    # Log into admin interface and invite users/check for 2FA
    BITWARDEN_ADMIN_TOKEN = os.environ.get("BITWARDEN_ADMIN_TOKEN")
    session = requests.Session()
    session.post(buildURL("/admin/"), {"token": BITWARDEN_ADMIN_TOKEN})
    raw_users = session.get(buildURL("/admin/users/"))
    # Map of email to 2FA status
    users = {user["Email"]: user["TwoFactorEnabled"] for user in raw_users.json()}
    print(users)
    return
