import logging
import os

import boto3
import hvac
from jinja2 import Template

logger = logging.getLogger("sync.vault")


def sync(teams, users):
    logger.info("Connecting to Vault via AWS IAM auth...")
    session = boto3.Session()
    credentials = session.get_credentials()
    client = hvac.Client(url=os.getenv("VAULT_ADDR"))
    client.auth.aws.iam_login(credentials.access_key, credentials.secret_key, credentials.token)
    if not client.sys.is_sealed():
        logger.info("Vault is unsealed, proceeding with policy sync")
        # Apply normal team policies
        with open("sync/modules/user-policy.hcl.j2") as f:
            t = Template(f.read())
            for team in teams["leads"]:
                base_team_slug = team.slug.replace("-leads", "")
                repos = [x.name for x in team.get_repos()]
                logger.info("Creating/updating policy '%s' with repos: %s", base_team_slug, ", ".join(repos))
                pol = t.render(team_name=base_team_slug, repos=repos)
                client.sys.create_or_update_policy(name=base_team_slug, policy=pol)
                logger.info("Mapping GitHub team '%s' -> Vault policy '%s'", team.slug, base_team_slug)
                client.auth.github.map_team(team_name=team.slug, policies=[base_team_slug])
        logger.info("Synced policies for %d lead team(s)", len(teams["leads"]))
    else:
        logger.error("Vault sealed. Stopping.")
        exit(1)
