from dataclasses import dataclass


@dataclass
class ForbiddenException(Exception):
    message: str = ''