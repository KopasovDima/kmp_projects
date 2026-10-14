import requests

from config.env import env


def send_email_event_reminder(email: str, subject: str, params: dict):
    send_email(email, subject, params, 'EVENT_REMINDER')


def send_unread_chats_reminder(email: str, subject: str, params: dict):
    send_email(email, subject, params, 'UNREAD_MESSAGES_REMINDER')


def send_email(email: str, subject: str, params: dict, template_name: str):
    requests.post(
        f'{env.KMP_NOTIFICATIONS_SERVICE_URL}/emails/send/',
        json={
            'template_name': template_name,
            'email': email,
            'subject': subject,
            'params': params,
        }
    )
