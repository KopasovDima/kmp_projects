import re

from django.contrib.auth import get_user_model

from kmp_auth.exceptions.bad_request_exception import BadRequestException
from kmp_auth.exceptions.forbidden_exception import ForbiddenException
from kmp_auth.models.user_profile import UserProfile
from kmp_auth.services import users
from kmp_auth.utils.related_apis import is_kmp, kmp_equipment


def validate_password(password: str):
    if len(password) < 8:
        return False

    if not re.search(r'[a-z]', password):
        return False

    if not re.search(r'[A-Z]', password):
        return False

    if not re.search(r'\d', password):
        return False

    special_chars = r'~!?@#$%^&*_-+()[]{}><\/|"\':.,'
    if not re.search(f'[{re.escape(special_chars)}]', password):
        return False

    return True


def check_password_change_required(user_profile: UserProfile):
    if user_profile.password_change_required:
        raise ForbiddenException(
            'Для совершения любых действий необходима смена пароля',
            {
                'password_change_required': True,
            },
        )


def change_password(new_password: str, user_id: int = 0, user_email: str = ''):
    if not new_password:
        raise BadRequestException('Не указан новый пароль')

    if not validate_password(new_password):
        raise BadRequestException(
            'Недостаточно надёжный пароль. Пароль должен быть не менее 8 символов, включать буквы в нижнем и '
            'верхнем регистре, содержать цифры и спец символы (~!?@#$%^&*_-+()[]{}><\/|"\':.,)'
        )

    if user_id:
        user = get_user_model().objects.filter(pk=user_id).first()
    elif user_email:
        user = get_user_model().objects.filter(email=user_email).first()
    else:
        raise BadRequestException('Неправильные параметры для смены пароля')

    if not user:
        raise BadRequestException('Пользователь с таким email не зарегистрирован')

    if user.check_password(new_password):
        raise BadRequestException('Новый пароль должен отличаться от старого')

    user.set_password(new_password)
    user.save()

    user_profile = users.get_user_profile_by_user_id(user.pk)
    if user_profile.password_change_required:
        user_profile.password_change_required = False
        user_profile.save()

    if user.is_superuser:
        is_kmp.change_password(user.email, new_password)
        kmp_equipment.change_password(user.email, new_password)
