from dataclasses import dataclass


@dataclass
class ForbiddenException(Exception):
    message: str = ''
    params: dict | None = None
