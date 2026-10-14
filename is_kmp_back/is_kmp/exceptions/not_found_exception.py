from dataclasses import dataclass


@dataclass
class NotFoundException(Exception):
    message: str = ''