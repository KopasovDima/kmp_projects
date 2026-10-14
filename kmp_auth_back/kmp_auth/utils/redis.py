import redis

from config.env import env

redis_client = redis.Redis(host=env.REDIS_HOST, port=env.REDIS_PORT, password=env.REDIS_PWD)
