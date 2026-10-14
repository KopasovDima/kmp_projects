from config.env import env
from is_kmp.utils.check_lib_installed import is_debug_toolbar_install

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

INTERNAL_IPS = []

if env.DJANGO_DEBUG and is_debug_toolbar_install():
    MIDDLEWARE.append('debug_toolbar.middleware.DebugToolbarMiddleware')

    INTERNAL_IPS = ['127.0.0.1']
