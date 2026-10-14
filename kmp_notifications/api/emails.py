from fastapi import APIRouter, Request

from request_models.send_email import SendEmailRequest
from utils.decorators import check_remote_ip_allowed
from utils.email import send_email

emails_router = APIRouter(prefix='/emails', tags=['Email notifications'])


@emails_router.post('/send/')
@check_remote_ip_allowed()
async def send(request: Request, send_email_request: SendEmailRequest):
    await send_email(
        send_email_request.template_name,
        send_email_request.email,
        send_email_request.subject,
        send_email_request.is_important,
        send_email_request.params,
    )

    return {'message': 'OK'}
