import requests

from config.env import env


def get_users(include_department):
    response = requests.get(f"{env.KMP_AUTH_SERVICE_URL}/auth/users/?{'include_department=true' if include_department else ''}")

    if response.status_code != 200:
        return []

    return response.json().get('users')
