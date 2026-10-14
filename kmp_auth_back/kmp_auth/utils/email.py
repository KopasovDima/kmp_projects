import requests

from config.env import env


def send_email_reset_password(email: str, reset_password_token: str):
    requests.post(
        f'{env.KMP_NOTIFICATIONS_SERVICE_URL}/emails/send/',
        json={
            'template_name': 'RESET_PASSWORD',
            'email': email,
            'subject': 'Сброс пароля',
            'params': {
                'reset_link': f'{env.RESET_PASSWORD_SERVICE_URL}/reset-password/{reset_password_token}/'
            },
        }
    )


def send_email_2fa_code(email: str, verification_code: str):
    requests.post(
        f'{env.KMP_NOTIFICATIONS_SERVICE_URL}/emails/send/',
        json={
            'template_name': '2FA_CODE',
            'email': email,
            'subject': 'Код подтверждения для входа',
            'params': {
                'verification_code_part1': verification_code[:2],
                'verification_code_part2': verification_code[2:4],
                'verification_code_part3': verification_code[4:],
            },
        }
    )
