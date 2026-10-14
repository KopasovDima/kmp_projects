import psycopg2
import psycopg2.extras

from config.env import env
from utils.logger import log


def get_statistics_db_connection():
    return get_db_connection(
        env.PSQL_KMP_STATISTICS_USER,
        env.PSQL_KMP_STATISTICS_HOST,
        env.PSQL_KMP_STATISTICS_PORT,
        env.PSQL_KMP_STATISTICS_DB,
        env.PSQL_KMP_STATISTICS_PWD,
    )


def get_is_kmp_db_connection():
    return get_db_connection(
        env.PSQL_IS_KMP_USER,
        env.PSQL_IS_KMP_HOST,
        env.PSQL_IS_KMP_PORT,
        env.PSQL_IS_KMP_DB,
        env.PSQL_IS_KMP_PWD,
    )


def get_kmp_auth_db_connection():
    return get_db_connection(
        env.PSQL_KMP_AUTH_USER,
        env.PSQL_KMP_AUTH_HOST,
        env.PSQL_KMP_AUTH_PORT,
        env.PSQL_KMP_AUTH_DB,
        env.PSQL_KMP_AUTH_PWD,
    )


def get_db_connection(db_user: str, db_host: str, db_port: int, db_name: str, db_pwd: str):
    try:
        return psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_pwd,
        )
    except (Exception, ) as e:
        log(f'Unable connect to database {db_name}: ' + str(e), True)
        raise e


def execute_sql(connection, sql: str, commit=False):
    try:
        cursor = connection.cursor()

        cursor.execute(sql)
        if commit:
            connection.commit()
    except (Exception, ) as e:
        log(f'Unable execute sql query: ' + str(e), True)


def execute_select_sql(connection, sql: str):
    try:
        cursor = connection.cursor(cursor_factory=psycopg2.extras.DictCursor)

        cursor.execute(sql)
        return cursor.fetchall()
    except (Exception, ) as e:
        log(f'Unable execute select sql query: ' + str(e), True)
