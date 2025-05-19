import os
import pkgutil
from dotenv import load_dotenv
load_dotenv()
from github import Github
from github import Auth

GITHUB_ACCESS_TOKEN = os.getenv("GITHUB_ACCESS_TOKEN")

def run():
    auth = Auth.Token(GITHUB_ACCESS_TOKEN)
    g = Github(auth=auth)
    gh_teams = g.get_organization("pennlabs").get_teams()
    for gh_team in gh_teams:
        print(gh_team.name)
    
    location = os.path.join(os.path.dirname(os.path.abspath(__file__)), "modules")
    for finder, name, _ in pkgutil.walk_packages([location]):
        try:
            module = finder.find_module(name).load_module(name)
            # module.sync(teams, users)
        except (AttributeError, TypeError) as e:
            print(f"Could not execute module '{name}'. The following exception occurred: {e}")

if __name__ == "__main__":
    run()
