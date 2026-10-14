from contextlib import ExitStack

import requests

from config.env import env


def get_1c_data(data):
    url = f'{env.SERVICE_URL_1C}/hs/kmp_do_api/IncomingRequest'

    headers = {
        'Content-Type': 'application/json',
        'Authorization': env.AUTH_TOKEN_1C,
    }

    response = requests.request('POST', url, headers=headers, data=data)

    return response
