import os
import shutil
import uuid

import jwt
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q
from django.views.decorators.http import require_POST, require_GET, require_http_methods

from config.base_dir import BASE_DIR
from config.env import env
from kmp_auth.exceptions.bad_request_exception import BadRequestException
from kmp_auth.services import users
from kmp_auth.services.users import get_user_profile_by_user_id
from kmp_auth.utils.attach_profile_photo import is_valid_image, attach_photo
from kmp_auth.utils.auth_decorators import require_auth
from kmp_auth.utils.consts import REDIS_TTL_10_M
from kmp_auth.utils.decorators import handle_request
from kmp_auth.utils.email import send_email_reset_password, send_email_2fa_code
from kmp_auth.utils.jwt_tokens import generate_tokens, decode_token, invalidate_token, validate_token, \
    generate_reset_password_token, generate_2fa_token_and_code, check_2fa_token_and_code
from kmp_auth.utils.password import check_password_change_required, change_password
from kmp_auth.utils.related_apis.is_kmp import get_companies
from kmp_auth.utils.token_types import REFRESH_TOKEN_TYPE, RESET_PASSWORD_TOKEN_TYPE
from kmp_auth.utils.upload_files import save_uploaded_files_locally
from kmp_auth.utils.urls import get_file_server_url


@require_POST
@handle_request
def login(request):
    username = (request.POST.get('login') or '').lower()
    password = request.POST.get('password')
    user = authenticate(username=username, password=password)

    if not user:
        raise BadRequestException('Неверные данные для входа')

    if not user.is_active:
        raise BadRequestException('Пользователь деактивирован')

    user_profile = users.get_user_profile_by_user_id(user_id=user.id)

    if not user_profile:
        raise BadRequestException('Регистрация пользователя не была полностью завершена')

    jwt_token, verification_code = generate_2fa_token_and_code(user.id)

    send_email_2fa_code(user.email, verification_code)

    return {
        '2fa_token': jwt_token,
    }


@require_POST
@handle_request
def login_2fa(request):
    jwt_token = request.POST.get('2fa_jwt_token')
    verification_code = request.POST.get('verification_code')

    return check_2fa_token_and_code(jwt_token, verification_code)


@require_http_methods(['PUT'])
@handle_request
def refresh(request):
    refresh_token = request.headers.get('Authorization', '')

    if not refresh_token or not refresh_token.startswith('Bearer '):
        raise BadRequestException('Ожидается получение Bearer токена')

    refresh_token = refresh_token.split(' ')[1]

    payload = decode_token(refresh_token, REFRESH_TOKEN_TYPE)

    user_id = payload.get('user_id', '')

    if not user_id:
        raise BadRequestException('Не определен пользователь')

    validate_token(refresh_token, user_id)
    invalidate_token(refresh_token, user_id)

    return generate_tokens(user_id)


@require_http_methods(['DELETE'])
@require_auth
def logout(request, _):
    access_token = request.headers.get('Authorization', '').split(' ')[1]

    token_payload = jwt.decode(access_token, env.JWT_SECRET_KEY, algorithms=[env.JWT_ALGORITHM])

    user_id = token_payload.get('user_id', '')

    invalidate_token(access_token, user_id)

    return 'OK'


@require_GET
@require_auth
def get_user_info(request, user_id: int):
    user_profile = users.get_user_profile_by_user_id(user_id)
    check_password_change_required(user_profile)
    roles = [role for role in user_profile.roles.all()] if user_profile else []

    company = get_companies(user_profile.company_id).get('companies', [None])[0]

    return {
        'user_id': user_id,

        'company': {
            'id': company.get('id'),
            'name': company.get('name'),
            'short_name': company.get('short_name'),
            'level': company.get('level'),
            'logo_url': company.get('logo_url'),
        } if company else None,

        'user_name': user_profile.user.username,
        'first_name': user_profile.user.first_name,
        'last_name': user_profile.user.last_name,
        'email': user_profile.user.email,
        'is_staff': user_profile.user.is_staff,
        'is_active': user_profile.user.is_active,

        'photo': get_file_server_url(request, user_profile.photo.url) if user_profile.photo else None,

        'roles': [{
            'id': role.identifier,
            'name': role.name,
        } for role in roles],
    }


@require_GET
@require_auth
def check_auth(_, user_id: int):
    user_profile = users.get_user_profile_by_user_id(user_id)
    check_password_change_required(user_profile)
    roles = [role for role in user_profile.roles.all()] if user_profile else []
    return {
        'user_id': user_id,
        'company_id': user_profile.company_id,
        'roles': [{
            'id': role.identifier,
            'name': role.name,
        } for role in roles],
    }


@require_POST
@handle_request
def request_password_reset(request):
    email = request.POST.get('email', '').lower()

    if not email:
        raise BadRequestException('Не указан email для восстановления пароля')

    user = get_user_model().objects.filter(Q(email=email) | Q(username=email)).first()

    if not user:
        raise BadRequestException(
            'Пользователь не найден. Проверьте правильность введённых данных или '
            'обратитесь в техподдержку для регистрации'
        )

    reset_password_token = generate_reset_password_token(user.email)
    send_email_reset_password(user.email, reset_password_token)

    return 'Письмо восстановления пароля отправлено на почту'


@require_POST
@handle_request
def reset_password(request):
    reset_password_token = request.POST.get('reset_password_token')

    if not reset_password_token:
        raise BadRequestException('Не указан токен для восстановления пароля')

    payload = decode_token(reset_password_token, RESET_PASSWORD_TOKEN_TYPE)

    if 'email' not in payload:
        raise BadRequestException('Не определен email пользователя')

    validate_token(reset_password_token)

    change_password(request.POST.get('new_password'), user_email=payload.get('email'))

    invalidate_token(reset_password_token, REDIS_TTL_10_M)

    return 'OK'


@require_POST
@require_auth
def change_password_for_auth_user(request, user_id):
    change_password(request.POST.get('new_password'), user_id=user_id)

    return 'OK'


@require_POST
@require_auth
def attach_profile_photo(request, user_id):
    file_folder = BASE_DIR / f'temp/{uuid.uuid4()}'
    files = save_uploaded_files_locally(request, file_folder)
    if not len(files):
        raise BadRequestException('Не прикреплена фотография')

    file_name, file_path = files.popitem()
    file_path = file_path['file_path']

    is_valid_image(file_path)

    try:
        user_profile = get_user_profile_by_user_id(user_id)

        attach_photo(user_profile, file_path, file_name)
    finally:
        if os.path.exists(file_folder):
            shutil.rmtree(file_folder)

    return {
        'user_profile_photo': get_file_server_url(request, user_profile.photo.url),
    }
