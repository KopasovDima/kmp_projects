import json

from django.views.decorators.http import require_POST, require_GET

from config.base_dir import BASE_DIR
from kmp_statistics.models.statistics_1c import Statistics1C
from kmp_statistics.models.user import User
from kmp_statistics.utils import external_services
from kmp_statistics.utils.decorators import handle_request


@require_GET
@handle_request
def get_users(_):
    users = User.objects.all().order_by('user_name')
    return {
        'users': [{
            'phone_number': user.phone_number,
            'user_name': user.user_name,
        } for user in users]
    }


@require_GET
@handle_request
def get_1c_users(_):
    _1c_users = Statistics1C.objects.values('_1c_user').distinct('_1c_user').order_by('_1c_user')

    return {
        'users': [{
            'name': user.get('_1c_user'),
        } for user in _1c_users if user.get('_1c_user')]
    }


@require_POST
@handle_request
def verify_users(_):
    number_of_created = 0
    for user in external_services.get_users(False):
        user_phone_number = user.get('number', '')
        if user_phone_number and user_phone_number != '-':
            db_user = User.objects.filter(phone_number=int(user_phone_number)).first()
            if db_user is None:
                User(phone_number=user_phone_number, user_name=user.get('name', '---')).save()
                number_of_created += 1
    return {
        'number_of_created': number_of_created,
    }
