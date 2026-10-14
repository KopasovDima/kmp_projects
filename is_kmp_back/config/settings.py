from corsheaders.defaults import default_headers
from import_export.formats.base_formats import XLSX, CSV, JSON
from split_settings.tools import include

from config.base_dir import BASE_DIR

include(
    'components/allowed_hosts.py',
    'components/channel_layers.py',
    'components/csrf_trusted_origins.py',
    'components/database.py',
    'components/debug.py',
    'components/installed_apps.py',
    'components/middleware.py',
    'components/secret_key.py',
)

CORS_ORIGIN_ALLOW_ALL = True

CORS_ALLOW_HEADERS = [
    *default_headers,
    'UseChildCompanyId',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'kmp_support/templates'
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

ASGI_APPLICATION = 'config.asgi.application'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'ru-RU'

TIME_ZONE = 'Europe/Moscow'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'static/'

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

FILE_UPLOAD_MAX_MEMORY_SIZE = 1024 * 1024 * 100  # 100 MB
DATA_UPLOAD_MAX_MEMORY_SIZE = None

IMPORT_EXPORT_FORMATS = [XLSX, CSV, JSON]
