import json

from django.views.decorators.http import require_POST, require_GET

from config.base_dir import BASE_DIR
from kmp_statistics.models.department import Department
from kmp_statistics.utils.decorators import handle_request


def read_json_departments():
    with open(BASE_DIR / 'departments.json', encoding='utf-8') as json_file:
        departments = json.loads(json_file.read())
    return departments


@require_GET
@handle_request
def get_departments(_):
    departments = Department.objects.all().order_by('name')
    return {
        'departments': [{
            '1c_uuid': department._1c_uuid,
            'sprav_id': department.sprav_id,
            'name': department.name,
        } for department in departments]
    }


@require_POST
@handle_request
def verify_departments(_):
    number_of_updated = 0
    not_found_number = 0
    for department in read_json_departments():
        db_department = Department.objects.filter(name=department.get('name')).first()
        if db_department is None:
            not_found_number += 1
            continue

        db_department.sprav_id = int(department.get('id', '0'))
        db_department.save()
        number_of_updated += 1
    return {
        'number_of_updated': number_of_updated,
        'not_found_number': not_found_number,
    }
