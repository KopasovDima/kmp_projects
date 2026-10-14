from jinja2 import Environment, FileSystemLoader

from config.base_dir import BASE_DIR
from exceptions.bad_request_exception import BadRequestException

TEMPLATES = {
    'RESET_PASSWORD': 'reset_password.html',
    'EVENT_REMINDER': 'event_reminder.html',
    'UNREAD_MESSAGES_REMINDER': 'unread_messages_reminder.html',
    '2FA_CODE': '2fa_code.html',
}

def render_email_message(params: dict, template_name: str):
    if template_name not in TEMPLATES:
        raise BadRequestException('Указан неправильный шаблон письма')

    env = Environment(loader=FileSystemLoader(f'{BASE_DIR}/email_templates'))

    template = env.get_template(TEMPLATES[template_name])

    return template.render(params)
