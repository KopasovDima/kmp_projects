import secrets
from datetime import datetime, timedelta, UTC

import jwt
from django.utils.crypto import get_random_string

from config.env import env
from kmp_auth.exceptions.auth_exception import AuthException
from kmp_auth.exceptions.bad_request_exception import BadRequestException
from kmp_auth.utils.consts import REDIS_TTL_1_H, EMAIL_2FA_CODE_LENGTH, REDIS_TTL_10_M, REDIS_TTL_7_D, \
    CHECK_2FA_MAX_ATTEMPTS
from kmp_auth.utils.hash import get_hash
from kmp_auth.utils.redis import redis_client
from kmp_auth.utils.token_types import RESET_PASSWORD_TOKEN_TYPE, REFRESH_TOKEN_TYPE, ACCESS_TOKEN_TYPE, \
    EMAIL_2FA_TOKEN_TYPE


def generate_2fa_token_and_code(user_id: int):
    payload = {
        'user_id': user_id,
        'type': EMAIL_2FA_TOKEN_TYPE,
        'exp': datetime.now(UTC) + timedelta(seconds=REDIS_TTL_10_M),
        'iat': datetime.now(UTC),
        'issued_by': env.SERVICE_URL,
    }

    verification_code = get_random_string(EMAIL_2FA_CODE_LENGTH, '0123456789')
    jwt_token = jwt.encode(payload, env.JWT_SECRET_KEY, algorithm=env.JWT_ALGORITHM)

    jwt_token_hash = get_hash(jwt_token)

    redis_client.set(f'2fa:{user_id}:{jwt_token_hash}:code', get_hash(verification_code), REDIS_TTL_10_M)
    redis_client.set(f'2fa:{user_id}:{jwt_token_hash}:attempts', 0, REDIS_TTL_10_M)

    return jwt_token, verification_code


def check_2fa_token_and_code(jwt_token: str, verification_code: str):
    if not jwt_token:
        raise BadRequestException('Не указан токен')

    if not verification_code:
        raise BadRequestException('Не указан код подтверждения')

    payload = decode_token(jwt_token, EMAIL_2FA_TOKEN_TYPE)

    user_id = payload.get('user_id', '')

    jwt_token_hash = get_hash(jwt_token)

    redis_verification_code = redis_client.get(f'2fa:{user_id}:{jwt_token_hash}:code')
    attempts = redis_client.get(f'2fa:{user_id}:{jwt_token_hash}:attempts')

    if not redis_verification_code or not attempts:
        raise AuthException('Нужно пройти авторизацию заново')

    attempts = int(attempts.decode('utf-8'))

    if secrets.compare_digest(redis_verification_code, get_hash(verification_code).encode('utf-8')):
        redis_client.delete(f'2fa:{user_id}:{jwt_token_hash}:code')
        redis_client.delete(f'2fa:{user_id}:{jwt_token_hash}:attempts')
        return generate_tokens(user_id)

    attempts += 1

    if attempts >= CHECK_2FA_MAX_ATTEMPTS:
        redis_client.delete(f'2fa:{user_id}:{jwt_token_hash}:code')
        redis_client.delete(f'2fa:{user_id}:{jwt_token_hash}:attempts')
        raise AuthException('Нужно пройти авторизацию заново')

    redis_client.set(f'2fa:{user_id}:{jwt_token_hash}:attempts', attempts, REDIS_TTL_10_M)

    raise BadRequestException('Неверный код')


def generate_tokens(user_id: int):
    access_payload = {
        'user_id': user_id,
        'type': ACCESS_TOKEN_TYPE,
        'exp': datetime.now(UTC) + timedelta(seconds=REDIS_TTL_1_H),
        'iat': datetime.now(UTC),
        'issued_by': env.SERVICE_URL,
    }
    access_token = jwt.encode(access_payload, env.JWT_SECRET_KEY, algorithm=env.JWT_ALGORITHM)

    refresh_payload = {
        'user_id': user_id,
        'type': REFRESH_TOKEN_TYPE,
        'exp': datetime.now(UTC) + timedelta(seconds=REDIS_TTL_7_D),
        'iat': datetime.now(UTC),
        'issued_by': env.SERVICE_URL,
    }
    refresh_token = jwt.encode(refresh_payload, env.JWT_SECRET_KEY, algorithm=env.JWT_ALGORITHM)

    access_token_hash = get_hash(access_token)
    refresh_token_hash = get_hash(refresh_token)
    redis_client.set(f'pair:{user_id}:{access_token_hash}', refresh_token_hash, REDIS_TTL_7_D)
    redis_client.set(f'pair:{user_id}:{refresh_token_hash}', access_token_hash, REDIS_TTL_7_D)

    return {
        'access': access_token,
        'refresh': refresh_token
    }


def generate_reset_password_token(email: str):
    payload = {
        'email': email,
        'type': RESET_PASSWORD_TOKEN_TYPE,
        'exp': datetime.now(UTC) + timedelta(seconds=REDIS_TTL_10_M),
        'iat': datetime.now(UTC),
        'issued_by': env.SERVICE_URL,
    }

    return jwt.encode(payload, env.JWT_SECRET_KEY, algorithm=env.JWT_ALGORITHM)


def decode_token(token: str, token_type: str):
    try:
        payload = jwt.decode(token, env.JWT_SECRET_KEY, algorithms=[env.JWT_ALGORITHM])

        if payload.get('type', '') != token_type:
            raise AuthException('Неверный тип токена')

        if payload.get('issued_by', '') != env.SERVICE_URL:
            raise AuthException('Токен выдан другим сервисом')

        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        raise AuthException()


def invalidate_token(token: str, user_id: int | str = None, ttl=REDIS_TTL_7_D):
    token_hash = get_hash(token)
    redis_client.set(f'blacklist:{token_hash}', 1, ttl)

    if user_id:
        # TODO: временное решение - исправить когда будут перевыпущены все токены - 05.11
        paired_token_hash = redis_client.get(f'pair:{token_hash}') or redis_client.get(f'pair:{user_id}:{token_hash}')
        if paired_token_hash:
            redis_client.set(f'blacklist:{paired_token_hash.decode("utf-8")}', 1, ttl)


def validate_token(token: str, user_id: int | str = None):
    token_hash = get_hash(token)

    if user_id:
        # TODO: временное решение - исправить когда будут перевыпущены все токены - 05.11
        paired_token_hash = redis_client.get(f'pair:{token_hash}') or redis_client.get(f'pair:{user_id}:{token_hash}')
    else:
        paired_token_hash = None

    if redis_client.exists(f'blacklist:{token_hash}') or \
            (paired_token_hash and redis_client.exists(f'blacklist:{paired_token_hash.decode("utf-8")}')):
        raise AuthException('Токен заблокирован')
