from github import Github
import re
import os
import requests
from requests.auth import HTTPBasicAuth
from grafana import GrafanaAPI

github = Github(os.getenv("GITHUB_TOKEN"))

teams = []
leads = []
for team in github.get_organization("pennlabs").get_teams():
    m = re.search(r'(\S+)-leads', team.slug)
    if not m:
        teams.append(team)
    else:
        leads.append((team, m.group(1)))
    
graf = GrafanaAPI('admin', 'En4^4&N$F@huwGztnCy6', 'grafana.pennlabs.org')

print(graf.get_user('dick'))
print(graf.get_team('test'))
print(teams)

team_id = []

for team in teams:
    team_dat = graf.get_team(team.name)['teams']
    if len(team_dat) == 0:
        uid = graf.add_team(team.name, 'pennappslabs@gmail.com')
        team_id.append((team, uid))
    else:
        team_id.append((team, team_dat[0]['id']))

print(team_id)

for team, uid in team_id:
    gh_members = team.get_members()
    for gh_member in gh_members:
        mem_found = graf.get_user(gh_member.login)
        if mem_found != {}:
            graf.add_team_user(mem_found['id'], uid)
