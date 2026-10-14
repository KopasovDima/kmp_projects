from http import HTTPStatus

import requests

from config.env import env


def get_internal_user_profiles(
        user_id: int | None = None,
        include_company_name: bool = False,
        include_photo: bool = False,
):
    try:
        query_params = []

        if user_id:
            query_params.append(f'user_ids={user_id}')

        if include_company_name:
            query_params.append('include_company_name=true')

        if include_photo:
            query_params.append('include_photo=true')

        auth_resp = requests.get(
            f'{env.KMP_AUTH_SERVICE}/auth/internal_user_profiles/' +
            ('?' + '&'.join(query_params) if query_params else '')
        )

        if auth_resp.status_code == HTTPStatus.OK:
            return auth_resp.json()
    finally:
        pass

    return {
        'user_profiles': []
    }


def get_internal_users_ids():
    internal_users = get_internal_user_profiles()
    internal_users_ids = []
    for user_profile in internal_users.get('user_profiles', []):
        if user_id := user_profile.get('user', {}).get('id', 0):
            internal_users_ids.append(user_id)

    return internal_users_ids


def verify_user_auth(auth_token: str):
    auth_resp = requests.get(f'{env.KMP_AUTH_SERVICE}/auth/check/', headers={'Authorization': auth_token})

    if auth_resp.status_code == HTTPStatus.OK:
        response = auth_resp.json()
        user_id = response.get('user_id', 0)
        user_company_id = response.get('company_id', 0)
        user_roles = [role.get('id') for role in response.get('roles', [])]

        return {
            'user_id': user_id,
            'user_company_id': user_company_id,
            'user_roles': user_roles,
        }

    return {
        **auth_resp.json(),
        'status': auth_resp.status_code,
    }
