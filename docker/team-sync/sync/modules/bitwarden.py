import base64
import hashlib
import os
import subprocess
import time

import requests
from pyotp import TOTP


BITWARDEN_URL = os.environ.get("BITWARDEN_URL")


def buildURL(path):
    return f"{BITWARDEN_URL}{path}"


def sync(teams, users):
    """
    Grant team leads and directors access to
    bitwarden based on their GitHub teams
    """

    # Credentials
    BITWARDEN_ADMIN_TOKEN = os.environ.get("BITWARDEN_ADMIN_TOKEN")
    BITWARDEN_EMAIL = os.environ.get("BITWARDEN_EMAIL")
    BITWARDEN_PASSWORD = base64.b64decode(os.environ.get("BITWARDEN_PASSWORD")).decode(
        "utf-8"
    )
    BITWARDEN_2FA_TOKEN = os.environ.get("BITWARDEN_2FA_TOKEN")
    totp = TOTP(BITWARDEN_2FA_TOKEN)

    # Configure bitwarden CLI
    subprocess.run(["bw", "config", "server", BITWARDEN_URL])
    subprocess.run(
        ["bw", "login", BITWARDEN_EMAIL, BITWARDEN_PASSWORD, "--code", totp.now()]
    )
    res = subprocess.run(
        ["bw", "unlock", BITWARDEN_PASSWORD, "--raw"], capture_output=True
    )
    os.environ["BW_SESSION"] = res.stdout.decode("utf-8")

    # Log into admin interface, invite users, and check for 2FA
    session = requests.Session()
    session.post(buildURL("/admin/"), {"token": BITWARDEN_ADMIN_TOKEN})
    raw_users = session.get(buildURL("/admin/users/"))

    # Generate Map of email to 2FA status
    twofac = {user["Email"]: user["TwoFactorEnabled"] for user in raw_users.json()}

    # Log into web vault
    res = session.post(
        buildURL("/api/accounts/prelogin"), json={"email": BITWARDEN_EMAIL}
    )
    body = res.json()
    res = session.post(
        buildURL("/identity/connect/token"),
        data={
            "scope": "api offline_access",
            "client_id": "web",
            "grant_type": "password",
            "username": BITWARDEN_EMAIL,
            "password": hashedPassword(
                BITWARDEN_PASSWORD, BITWARDEN_EMAIL, body["KdfIterations"]
            ),
            "deviceType": "8",
            "deviceIdentifier": "1ab51ab5-1ab5-1ab5-1ab5-1ab51ab51ab5",
            "deviceName": "firefox",
            "twoFactorToken": totp.now(),
            "twoFactorProvider": "0",
            "twoFactorRemember": "0",
        },
    )
    body = res.json()
    if "access_token" not in body:
        # Authentication failed. Most likely due to TOTP
        print("Bitwarden: TOTP code invalid")
        # Sleep to ensure next job uses a different TOTP code
        time.sleep(45)
        exit(1)
    session.headers.update({"Authorization": f"Bearer {body['access_token']}"})

    # Generate mapping of organization to uuid
    res = session.get(buildURL("/api/sync?excludeDomains=true"))
    body = res.json()
    raw_orgs = body["Profile"]["Organizations"]
    organizations = {org["Name"]: org["Id"] for org in raw_orgs}

    # Grant team leads access to bitwarden organizations
    for team in teams["leads"]:
        name = team.name[:-6]  # Strip Leads
        invite_members(organizations[name], team, users, session)
        confirm_access(organizations[name], twofac, session)

    # Grant directors access to director organization
    for team in teams["directors"]:
        name = team.name
        invite_members(organizations[name], team, users, session)
        confirm_access(organizations[name], twofac, session)
    return


def invite_members(organization_uuid, team, users, session):
    """
    Given a bitwarden organization and a GitHub team, invite all members of that team
    into the organization
    """

    # Invite users to be a Manager with access to all collections
    for member in team.get_members():
        gh_id = member.login.lower()
        if gh_id in users:
            email = users[gh_id]["email"]
            # Make individual requests because bw errors out if an email is already invited
            data = {
                "emails": [email],
                "collections": None,
                "accessAll": True,
                "type": 1,
                "permissions": {
                    "response": None,
                    "accessBusinessPortal": False,
                    "accessEventLogs": False,
                    "accessImportExport": False,
                    "accessReports": False,
                    "manageAllCollections": False,
                    "manageAssignedCollections": False,
                    "manageGroups": False,
                    "manageSso": False,
                    "managePolicies": False,
                    "manageUsers": False,
                },
            }
            session.post(
                buildURL(f"/api/organizations/{organization_uuid}/users/invite"),
                json=data,
            )


def confirm_access(organization_uuid, twofac, session):
    """
    Confirm all invited users to an organization if they have enabled 2Fa
    """
    res = session.get(buildURL(f"/api/organizations/{organization_uuid}/users"))
    body = res.json()
    for user in body["Data"]:
        # If user has 2FA enabled, confirm access
        email = user["Email"]
        id_ = user["Id"]
        accepted = user["Status"] == 1
        if accepted and email in twofac and twofac[email]:
            # I can't figure out how to reverse engineer the confirm route after a user accepts
            # an invite. I know that we encrypt an "org key" using the invited user's public key
            # however, I'm not sure what that "org key" is. Looking at the official CLI, I think
            # it's calculated using your personal private key. Since it's too complicated we just
            # invoke the official CLI to accept users
            res = subprocess.run(
                [
                    "bw",
                    "confirm",
                    "org-member",
                    id_,
                    "--organizationid",
                    organization_uuid,
                ]
            )


# Crypto copied from
# https://github.com/birlorg/bitwarden-cli/blob/trunk/python/bitwarden/crypto.py


def makeKey(password, salt, iterations):
    if not hasattr(password, "decode"):
        password = password.encode("utf-8")
    if not hasattr(salt, "decode"):
        salt = salt.lower()
        salt = salt.encode("utf-8")
    return hashlib.pbkdf2_hmac("sha256", password, salt, iterations, dklen=32)


def hashedPassword(password, salt, iterations):
    if not hasattr(password, "decode"):
        password = password.encode("utf-8")
    key = makeKey(password, salt, iterations)
    return base64.b64encode(
        hashlib.pbkdf2_hmac("sha256", key, password, 1, dklen=32)
    ).decode("utf-8")
