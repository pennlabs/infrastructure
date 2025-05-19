import os
import pkgutil
from dotenv import load_dotenv
load_dotenv()
from github import Github
from github import Auth
from pyairtable import Api as AirtableAPI


AIRTABLE_BASE_KEY = os.environ.get("AIRTABLE_BASE_KEY")
AIRTABLE_API_KEY = os.environ.get("AIRTABLE_API_KEY")
airtable_api = AirtableAPI(AIRTABLE_API_KEY)
airtable = airtable_api.table(AIRTABLE_BASE_KEY, "Roster")


def get_user_info():
    """
    Create a dictionary of GitHub usernames to PennKeys and emails.
    """
    airtable.all()
    roster = airtable.all(view="Platform Sync", fields=["Github", "PennKey", "Email"])
    data = {}
    for record in roster:
        fields = record["fields"]
        if "Github" in fields and "PennKey" in fields:
            github_url = fields["Github"].lower()
            pennkey = fields["PennKey"].lower()
            email = fields["Email"].lower()
            if github_url.startswith("https://github.com/"):
                github_id = github_url.split("/")[3]
                data[github_id] = {"pennkey": pennkey, "email": email}
    return data


def run():
    auth = Auth.Token(os.getenv("GITHUB_TOKEN"))
    g = Github(auth=auth)

    # Generate dictionary of teams
    teams = {}
    for team in g.get_organization("pennlabs").get_teams():
        if team.name == "Alumni":  # Found an Alumni Team
            teams.setdefault("alumni", []).append(team)
        elif team.name == "Directors":  # Found a Director Team
            teams.setdefault("directors", []).append(team)
        elif team.slug.endswith("-leads"):  # Found a Lead Team
            teams.setdefault("leads", []).append(team)
        else:  # Found a Regular Team
            teams.setdefault("members", []).append(team)

    # Generate dictionary of GitHub usernames to PennKey
    users = get_user_info()


    # Dynamically find each module and run its sync method
    # location = os.path.join(os.path.dirname(os.path.abspath(__file__)), "modules")
    # for finder, name, _ in pkgutil.walk_packages([location]):
    #     try:
    #         module = finder.find_module(name).load_module(name)
    #         # module.sync(teams, users)
    #     except (AttributeError, TypeError) as e:
    #         print(f"Could not execute module '{name}'. The following exception occurred: {e}")


if __name__ == "__main__":
    run()
