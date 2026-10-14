from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from config.base_dir import BASE_DIR


class EnvClass(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=f'{BASE_DIR}/.env',
        env_file_encoding='utf-8',
        extra='ignore',
    )

    ALLOWED_REMOTE_IPS: list[str] | str = Field(default=['127.0.0.1'])

    SMTP_SERVER: str = Field(default='smtp.mail.ru')
    SMTP_PORT: int = Field(default=587)
    SMTP_LOGIN: str = Field(default='test@mail.ru')
    SMTP_PWD: str = Field(default='email_pwd')


    @field_validator('ALLOWED_REMOTE_IPS', mode='before')
    def split_strings(cls, value):
        if isinstance(value, str):
            return value.split(',')
        return value


env = EnvClass()
