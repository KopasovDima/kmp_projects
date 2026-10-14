from config.env import env
from is_kmp.utils.check_lib_installed import is_debug_toolbar_install

INSTALLED_APPS = [
    'daphne',
    'channels',
    'is_kmp',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'import_export',
    'corsheaders',
]

if env.DJANGO_DEBUG and is_debug_toolbar_install():
    INSTALLED_APPS = INSTALLED_APPS + ['debug_toolbar']
