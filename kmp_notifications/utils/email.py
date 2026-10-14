from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from config.env import env
from config.logger import log_info
from exceptions.bad_request_exception import BadRequestException
from utils.jinja_renderer import render_email_message


async def send_email(template_name: str, to: str, subject: str, is_important: bool, render_params: dict):
    if not to or '@' not in to:
        raise BadRequestException('Email отправителя имеет неверный формат')

    text = render_email_message(render_params, template_name)

    message = MIMEMultipart()
    message['Subject'] = subject
    message['To'] = to
    message['From'] = env.SMTP_LOGIN

    if is_important:
        message['Importance'] = 'high'
        message['Priority'] = 'urgent'
        message['X-Priority'] = '1'

    message.attach(MIMEText(text, 'html', 'utf-8'))

    await aiosmtplib.send(
        message,
        hostname=env.SMTP_SERVER,
        port=env.SMTP_PORT,
        username=env.SMTP_LOGIN,
        password=env.SMTP_PWD,
        start_tls=True,
    )

    log_info(f'Email sent to {to}. Template name: {template_name}')
