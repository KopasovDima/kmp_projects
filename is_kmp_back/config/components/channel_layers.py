from urllib.parse import quote

from config.env import env

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [(f'redis://:{quote(env.REDIS_PWD, safe="")}@{env.REDIS_HOST}:{env.REDIS_PORT}/0'), ],
        },
    },
}
