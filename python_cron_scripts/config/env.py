from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class EnvClass(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=f'{BASE_DIR}/.env',
        env_file_encoding='utf-8',
        extra='ignore',
    )

    REDMINE_API_KEY: str = Field(default='test')
    REDMINE_SERVICE_URL: str = Field(default='http://localhost')

    PSQL_IS_KMP_USER: str = Field(default='test')
    PSQL_IS_KMP_HOST: str = Field(default='localhost')
    PSQL_IS_KMP_PORT: int = Field(default=5432)
    PSQL_IS_KMP_DB: str = Field(default='db_is_kmp_name')
    PSQL_IS_KMP_PWD: str = Field(default='test_password')

    PSQL_KMP_STATISTICS_USER: str = Field(default='test')
    PSQL_KMP_STATISTICS_HOST: str = Field(default='localhost')
    PSQL_KMP_STATISTICS_PORT: int = Field(default=5432)
    PSQL_KMP_STATISTICS_DB: str = Field(default='db_statistics_name')
    PSQL_KMP_STATISTICS_PWD: str = Field(default='test_password')

    PSQL_KMP_AUTH_USER: str = Field(default='test')
    PSQL_KMP_AUTH_HOST: str = Field(default='localhost')
    PSQL_KMP_AUTH_PORT: int = Field(default=5432)
    PSQL_KMP_AUTH_DB: str = Field(default='db_kmp_auth_name')
    PSQL_KMP_AUTH_PWD: str = Field(default='test_password')

    AUTH_TOKEN_1C: str = Field(default='test')
    SERVICE_URL_1C: str = Field(default='http://kmpdo/DO_30')

    KMP_NOTIFICATIONS_SERVICE_URL: str = Field(default='http://localhost:8000')
    KMP_AUTH_SERVICE_URL: str = Field(default='http://localhost:8000')
    IS_KMP_SERVICE_URL: str = Field(default='http://localhost:8000')

    IS_KMP_UNREAD_CHATS_NOTIFICATION_SETTING_ID: int = Field(default=0)

env = EnvClass()
