#!/usr/bin/env python
"""
Test script to compare output of old Airtable-based get_user_info vs new YAML-based version.
Run this to verify the YAML migration produces the same output.
"""
import os
import yaml
from airtable import Airtable


# ============ OLD AIRTABLE VERSION ============
def get_user_info_airtable():
    """
    Original Airtable-based function.
    Requires AIRTABLE_BASE_KEY and AIRTABLE_API_KEY environment variables.
    """
    AIRTABLE_BASE_KEY = os.environ.get("AIRTABLE_BASE_KEY")
    AIRTABLE_API_KEY = os.environ.get("AIRTABLE_API_KEY")
    airtable = Airtable(AIRTABLE_BASE_KEY, "Roster", AIRTABLE_API_KEY)

    roster = airtable.get_all(view="Platform Sync", fields=["Github", "PennKey", "Email"])
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


# ============ NEW YAML VERSION ============
def get_user_info_yaml():
    """
    New YAML-based function.
    Reads from roster.yaml in the same directory.
    """
    roster_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "roster.yaml")
    
    with open(roster_path, 'r') as f:
        roster_data = yaml.safe_load(f)
    
    data = {}
    for member in roster_data["roster"]:
        github_id = member['github'].lower()
        pennkey = member['pennkey'].lower()
        email = member['email'].lower()
        data[github_id] = {"pennkey": pennkey, "email": email}
    
    return data


def compare_outputs():
    """
    Compare the outputs of both functions.
    """
    print("=" * 60)
    print("Fetching data from Airtable...")
    print("=" * 60)
    
    try:
        airtable_data = get_user_info_airtable()
        print(f"Airtable returned {len(airtable_data)} users")
    except Exception as e:
        print(f"Error fetching from Airtable: {e}")
        print("Make sure AIRTABLE_BASE_KEY and AIRTABLE_API_KEY are set")
        return
    
    print("\n" + "=" * 60)
    print("Fetching data from YAML...")
    print("=" * 60)
    
    yaml_data = get_user_info_yaml()
    print(f"YAML returned {len(yaml_data)} users")
    
    print("\n" + "=" * 60)
    print("Comparing outputs...")
    print("=" * 60)
    
    # Check for users in Airtable but not in YAML
    airtable_only = set(airtable_data.keys()) - set(yaml_data.keys())
    if airtable_only:
        print(f"\n⚠️  Users in Airtable but NOT in YAML ({len(airtable_only)}):")
        for user in sorted(airtable_only):
            print(f"  - {user}: {airtable_data[user]}")
    
    # Check for users in YAML but not in Airtable
    yaml_only = set(yaml_data.keys()) - set(airtable_data.keys())
    if yaml_only:
        print(f"\n⚠️  Users in YAML but NOT in Airtable ({len(yaml_only)}):")
        for user in sorted(yaml_only):
            print(f"  - {user}: {yaml_data[user]}")
    
    # Check for mismatched data
    common_users = set(airtable_data.keys()) & set(yaml_data.keys())
    mismatches = []
    for user in common_users:
        if airtable_data[user] != yaml_data[user]:
            mismatches.append(user)
    
    if mismatches:
        print(f"\n⚠️  Users with mismatched data ({len(mismatches)}):")
        for user in sorted(mismatches):
            print(f"  - {user}:")
            print(f"      Airtable: {airtable_data[user]}")
            print(f"      YAML:     {yaml_data[user]}")
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    if not airtable_only and not yaml_only and not mismatches:
        print("✅ SUCCESS: Both sources return identical data!")
    else:
        print(f"❌ DIFFERENCES FOUND:")
        print(f"   - Only in Airtable: {len(airtable_only)}")
        print(f"   - Only in YAML: {len(yaml_only)}")
        print(f"   - Mismatched data: {len(mismatches)}")


def print_yaml_output():
    """
    Just print the YAML output (doesn't require Airtable credentials).
    """
    print("=" * 60)
    print("YAML Output (get_user_info_yaml)")
    print("=" * 60)
    
    data = get_user_info_yaml()
    print(f"Total users: {len(data)}\n")
    
    for github_id in sorted(data.keys()):
        print(f"{github_id}: {data[github_id]}")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--yaml-only":
        # Just test YAML output without needing Airtable
        print_yaml_output()
    else:
        # Full comparison (requires Airtable credentials)
        compare_outputs()
