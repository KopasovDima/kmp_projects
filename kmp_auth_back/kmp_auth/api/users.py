import json
from itertools import zip_longest

from django.views.decorators.http import require_GET

from config.base_dir import BASE_DIR
from kmp_auth.models.user_profile import UserProfile
from kmp_auth.utils.decorators import handle_request, check_remote_ip_allowed
from kmp_auth.utils.related_apis.is_kmp import get_companies
from kmp_auth.utils.request_params import get_request_value_list_int, get_request_value_bool, get_request_value_list_str
from kmp_auth.utils.urls import get_file_server_url


def read_json_users():
    with open(BASE_DIR / 'users.json', encoding='utf-8') as json_file:
        staff = json.loads(json_file.read())
    return staff


@require_GET
@handle_request
def get_users(request):
    include_department = get_request_value_bool(request.GET, 'include_department')
    search_names = get_request_value_list_str(request.GET, 'search_names')

    users_response = []
    search_name_params = []

    if search_names:
        for search_name in search_names:
            search_name_parts = search_name.strip().split(' ')
            search_name_param_value = []
            for search_name_part in search_name_parts:
                search_exact_value = True
                if '*' in search_name_part:
                    search_name_part = search_name_part.replace('*', '')
                    search_exact_value = False
                search_name_param_value.append((search_name_part, search_exact_value))

            search_name_params.append(search_name_param_value)

    for user in read_json_users():
        user_name = user['name']
        if search_name_params:
            user_found = False
            for search_name_param_value in search_name_params:
                if user_found:
                    break
                all_checks_passes = True
                for user_name_part, search_name_condition in zip_longest(user_name.split(' '), search_name_param_value):
                    search_name_part, search_exact_value = search_name_condition if search_name_condition else (None,
                                                                                                                None)
                    if not search_name_part or not all_checks_passes:
                        continue
                    if search_exact_value:
                        if user_name_part.lower() != search_name_part.lower():
                            all_checks_passes = False
                    else:
                        if not user_name_part.lower().startswith(search_name_part.lower()):
                            all_checks_passes = False
                if not all_checks_passes:
                    continue
                user_found = True
            if not user_found:
                continue

        user_info = {
            'id': user['id'],
            'number': user['number'],
            'name': user_name,
            'job_title': user['job_title'],
            'email': user['email'],
        }

        if include_department:
            user_info['department'] = user['department']

        users_response.append(user_info)

    return {
        'users': users_response,
    }


@require_GET
@check_remote_ip_allowed
def get_internal_user_profiles(request):
    user_ids = get_request_value_list_int(request.GET, 'user_ids')
    include_company_name = get_request_value_bool(request.GET, 'include_company_name')
    include_email = get_request_value_bool(request.GET, 'include_email')
    include_photo = get_request_value_bool(request.GET, 'include_photo')

    user_profiles = UserProfile.objects.order_by('user__last_name', 'user__first_name')

    if user_ids:
        user_profiles = user_profiles.filter(user__id__in=user_ids)

    response = []

    for user_profile in user_profiles:
        company_info = {
            'id': user_profile.company_id,
        } if user_profile.company_id else None

        if include_company_name and company_info:
            company = get_companies(user_profile.company_id).get('companies', [{}])[0]
            company_info['name'] = company.get('name')
            company_info['short_name'] = company.get('short_name')

        user_profile_info = {
            'id': user_profile.id,
            'post': user_profile.post,
            'user': {
                'id': user_profile.user.id,
                'first_name': user_profile.user.first_name,
                'last_name': user_profile.user.last_name,
            } if user_profile.user else None,
            'company': company_info,
        }

        if include_email:
            user_profile_info['user']['email'] = user_profile.user.email

        if include_photo and user_profile.photo:
            user_profile_info['user']['photo'] = get_file_server_url(request, user_profile.photo.url)

        response.append(user_profile_info)

    return {
        'user_profiles': response,
    }
