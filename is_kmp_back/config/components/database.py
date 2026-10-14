from config.env import env

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': env.PSQL_DB_NAME,
        'USER': env.PSQL_USER,
        'PASSWORD': env.PSQL_PWD,
        'HOST': env.PSQL_HOST,
        'PORT': env.PSQL_PORT,
    },
    'kmp_auth': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'kmp_auth',
        'USER': env.PSQL_USER,
        'PASSWORD': env.PSQL_PWD,
        'HOST': env.PSQL_HOST,
        'PORT': env.PSQL_PORT,
    },
}