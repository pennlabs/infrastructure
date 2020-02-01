import os
import re

import hvac
from github import Github
from jinja2 import Template


g = Github(os.getenv("GITHUB_TOKEN"))

teams = []
for team in g.get_organization("pennlabs").get_teams():
    m = re.search(r"(\S+)-leads", team.slug)
    if m:
        teams.append((team.slug, m.group(1)))

client = hvac.Client(url=os.getenv("VAULT_ADDR"))

with open("/var/run/secrets/kubernetes.io/serviceaccount/token") as f:
    jwt = f.read()
    client.auth_kubernetes("team-auth", jwt)

if not client.sys.is_sealed():
    with open("user-policy.hcl.j2") as f:
        t = Template(f.read())
        for team in teams:
            team_name, team_slug = team
            pol = t.render(team_name=team_slug)
            client.sys.create_or_update_policy(name=team_slug, policy=pol)
            client.auth.github.map_team(team_name=team_name, policies=[team_slug])
else:
    print("Vault sealed. Stopping.")
