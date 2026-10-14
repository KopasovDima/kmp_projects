from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from config.base_dir import BASE_DIR


class EnvClass(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=f'{BASE_DIR}/.env',
        env_file_encoding='utf-8',
        extra='ignore',
    )

    DJANGO_DEBUG: bool = Field(default=True)
    DJANGO_HTTPS_ENABLED: bool = Field(default=False)
    DJANGO_ALLOWED_HOSTS: str = Field(default='localhost')
    DJANGO_SECRET_KEY: str = Field(default='key')
    DJANGO_ALLOWED_REMOTE_IPS: list[str] | str = Field(default=['127.0.0.1'])
    DJANGO_CSRF_TRUSTED_ORIGINS: str = Field(default='http://localhost')

    PSQL_USER: str = Field(default='test')
    PSQL_PWD: str = Field(default='test_password')
    PSQL_HOST: str = Field(default='localhost')
    PSQL_PORT: int = Field(default=5432)
    PSQL_DB_NAME: str = Field(default='db_name')

    REDIS_HOST: str = Field(default='localhost')
    REDIS_PORT: str = Field(default='6379')
    REDIS_PWD: str = Field(default='11111')

    KMP_AUTH_SERVICE: str = Field(default='http://localhost/')

    @field_validator('DJANGO_ALLOWED_REMOTE_IPS', mode='before')
    def split_strings(cls, value):
        if isinstance(value, str):
            return value.split(',')
        return value


env = EnvClass()
