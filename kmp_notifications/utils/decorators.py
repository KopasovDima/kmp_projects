from functools import wraps

from fastapi import HTTPException, Request

from config.env import env
from config.logger import log_error


def check_remote_ip_allowed():
    def decorator(func):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            client_ip = request.client.host

            if '*' not in env.ALLOWED_REMOTE_IPS:
                if client_ip not in env.ALLOWED_REMOTE_IPS:
                    log_error(f'Forbidden request from {client_ip}')
                    raise HTTPException(
                        status_code=403,
                        detail='Access denied',
                    )

            return await func(request, *args, **kwargs)
        return wrapper
    return decorator
