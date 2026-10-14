from http import HTTPStatus

import requests

from config.env import env


def get_users():
    response = requests.get(f'{env.KMP_AUTH_SERVICE_URL}/auth/users/')

    if response.status_code != HTTPStatus.OK:
        return []

    return response.json().get('users')


def get_internal_users():
    response = requests.get(f'{env.KMP_AUTH_SERVICE_URL}/auth/internal_user_profiles/?include_email=true')

    if response.status_code != HTTPStatus.OK:
        return []

    return response.json().get('user_profiles')
