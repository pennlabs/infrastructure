import os

import boto3
import hvac
from jinja2 import Template


def sync(teams):
    # TODO: remove
    return
    session = boto3.Session()
    credentials = session.get_credentials()
    client = hvac.Client(url=os.getenv("VAULT_ADDR"))
    client.auth.aws.iam_login(credentials.access_key, credentials.secret_key, credentials.token)
    if not client.sys.is_sealed():
        # Apply normal team policies
        with open("sync/modules/user-policy.hcl.j2") as f:
            t = Template(f.read())
            for team in teams["leads"]:
                base_team_slug = team.slug.replace("-leads", "")
                repos = [x.name for x in team.get_repos()]
                pol = t.render(team_name=base_team_slug, repos=repos)
                client.sys.create_or_update_policy(name=base_team_slug, policy=pol)
                client.auth.github.map_team(team_name=team.slug, policies=[base_team_slug])
    else:
        print("vault: Vault sealed. Stopping.")
        exit(1)
