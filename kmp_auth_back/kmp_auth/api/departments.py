import json

from django.views.decorators.http import require_GET

from config.base_dir import BASE_DIR
from kmp_auth.utils.decorators import handle_request


def read_json_departments():
    with open(BASE_DIR / 'departments.json', encoding='utf-8') as json_file:
        departments = json.loads(json_file.read())
    return departments


@require_GET
@handle_request
def get_departments(_):
    departments_response = []

    for department in read_json_departments():
        departments_response.append({
            'id': department['id'],
            'name': department['name'],
        })

    return {
        'departments': departments_response,
    }
