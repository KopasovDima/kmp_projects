from config.env import env
import requests


def change_password(email: str, password: str):
    if not env.KMP_EQUIPMENT_URL:
        return
    try:
        requests.post(f'{env.KMP_EQUIPMENT_URL}/admin_user/change_password/', data={'email': email, 'password': password})
    finally:
        pass
