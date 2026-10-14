from config.env import env

ALLOWED_HOSTS = env.DJANGO_ALLOWED_HOSTS.split(',')