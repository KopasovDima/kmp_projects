import requests

from config.env import env
from config.logger import log_error


def change_password(email: str, password: str):
    try:
        requests.post(
            f'{env.IS_KMP_SERVICE_URL}/admin_user/change_password/', data={'email': email, 'password': password},
        )
    except (Exception,) as e:
        log_error(f'Change user password failed: {e}')


def get_companies(company_id: int | None = None):
    try:
        return requests.get(
            f'{env.IS_KMP_SERVICE_URL}/is_kmp/companies/{f"?company_id={company_id}" if company_id else ""}',
        ).json()
    except (Exception,) as e:
        log_error(f'Get companies request failed: {e}')

    return {}
