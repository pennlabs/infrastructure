from github import Github
from getpass import getpass
import re
import hvac
import os
from jinja2 import Template

g = Github(os.getenv("GITHUB_TOKEN"))

teams = []
for team in g.get_organization("pennlabs").get_teams():
    m = re.search(r'(\S+)-leads', team.slug)
    if m:
        teams.append(m.group(1))

client = hvac.Client(
    url='http://vault.default'
)

if not client.sys.is_sealed():
    with open("user_policy.hcl.j2") as f:
        t = Template(f.read())
        for team in teams:
            pol = t.render(team_name = team)
            client.sys.create_or_update_policy(
                name=team,
                policy=pol,
            )
else:
    print("Vault sealed. Stopping.")
