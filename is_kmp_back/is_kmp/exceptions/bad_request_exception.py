from dataclasses import dataclass


@dataclass
class BadRequestException(Exception):
    message: str = ''