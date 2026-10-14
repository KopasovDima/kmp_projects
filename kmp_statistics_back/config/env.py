from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

from config.base_dir import BASE_DIR


class EnvClass(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=f'{BASE_DIR}/.env',
        env_file_encoding='utf-8',
        extra='ignore',
    )

    DJANGO_DEBUG: bool = Field(default=True)
    DJANGO_ALLOWED_HOSTS: str = Field(default='localhost')
    DJANGO_SECRET_KEY: str = Field(default='key')

    PSQL_USER: str = Field(default='test')
    PSQL_PWD: str = Field(default='test_password')
    PSQL_HOST: str = Field(default='localhost')
    PSQL_PORT: int = Field(default=5432)
    PSQL_DB_NAME: str = Field(default='db_name')

    ZABBIX_API: str = Field(default='http://zabbix-api/')
    ZABBIX_API_KEY: str = Field(default='api_key')

    KMP_AUTH_SERVICE_URL: str = Field(default='http://localhost:8000')


env = EnvClass()
