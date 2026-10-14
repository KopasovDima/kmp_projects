from http import HTTPStatus

import requests

from config.env import env


def check_unread_chats_notification_enabled(user_id: int):
    response = requests.get(
        f'{env.IS_KMP_SERVICE_URL}/is_kmp/settings/notifications/{env.IS_KMP_UNREAD_CHATS_NOTIFICATION_SETTING_ID}/'
        f'check_enabled/?user_id={user_id}'
    )

    if response.status_code != HTTPStatus.OK:
        raise Exception('Failed to get notifications setting status')

    return response.json().get('value')


def get_unread_chats(user_id: int):
    response = requests.get(
        f'{env.IS_KMP_SERVICE_URL}/is_kmp/chats/unread_chats/?user_id={user_id}'
    )

    if response.status_code != HTTPStatus.OK:
        raise Exception('Failed to get unread chats')

    return response.json().get('unread_chats')
