from config.env import env

CSRF_TRUSTED_ORIGINS = env.DJANGO_CSRF_TRUSTED_ORIGINS.split(',')
