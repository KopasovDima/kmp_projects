from pydantic import BaseModel


class SendEmailRequest(BaseModel):
    template_name: str
    email: str
    subject: str
    is_important: bool = False
    params: dict
