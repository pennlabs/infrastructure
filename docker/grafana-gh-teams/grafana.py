import requests
import json
from requests.auth import HTTPBasicAuth
import urllib

class GrafanaAPI:
    def __init__(self, uname, password, host):
        self.uname = uname
        self.password = password
        self.host = host

    def get(self, path):
        url = f'https://{self.host}/api/{path}'
        r = requests.get(url, auth=HTTPBasicAuth(self.uname, self.password))
        return r

    def post(self, path, data):
        url = f'https://{self.host}/api/{path}'
        r = requests.post(url, json=data, auth=HTTPBasicAuth(self.uname, self.password))
        if r.status_code != 200:
            raise Exception(f'Expected status code 200 but got {r.status_code} for url {url} and data {data}.')
        return r

    def get_user(self, uname):
        path = f'users/lookup?loginOrEmail={uname}'
        q = self.get(path)
        if q.status_code == 404:
            return {}
        if q.status_code != 200:
            raise Exception(f'Expected status code 200 but got {q.status_code} for path {path}.')
        return json.loads(q.content)

    def get_team(self, team_name):
        escaped = urllib.parse.quote(team_name, safe='')
        path = f'teams/search?name={escaped}'
        q = self.get(path)
        if q.status_code != 200:
            raise Exception(f'Expected status code 200 but got {q.status_code} for path {path}.')
        return json.loads(q.content)

    def add_team(self, name, email):
        data = {
            "name": name,
            "email": email
        }
        q = self.post('teams', data)
        return json.loads(q.content)["teamId"]

    def add_team_user(self, team_id, user_id):
        data = {
            "userId": user_id
        }
        q = self.post(f'teams/{team_id}/members', data)
        return json.loads(q.content)
