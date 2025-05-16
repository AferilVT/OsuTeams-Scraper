import requests
from bs4 import BeautifulSoup

def get_osu_teams_count_and_last_url():
    base_url = "https://osu.ppy.sh/teams/"
    team_id = 1  # Start from team ID 1
    last_team_url = None
    count = 0

    while True:
        team_url = f"{base_url}{team_id}"
        response = requests.get(team_url)

        # If the page doesn't exist, stop the loop
        if response.status_code != 200:
            break

        # If the page exists, continue to the next ID
        last_team_url = team_url
        count += 1
        team_id += 1

    print(f"Total osu!Teams: {count}")
    print(f"Last osu!Team URL: {last_team_url}")

if __name__ == "__main__":
    get_osu_teams_count_and_last_url()