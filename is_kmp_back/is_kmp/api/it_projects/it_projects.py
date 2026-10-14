from datetime import datetime

from django.http.multipartparser import MultiPartParser
from django.views.decorators.http import require_GET, require_POST

from is_kmp.consts.roles import ROLE_IT_SPECIALIST
from is_kmp.models.it_project import ITProject
from is_kmp.services.it_projects.it_projects import get_it_project_by_id_or_exception
from is_kmp.utils.decimal_utils import convert_decimal
from is_kmp.utils.decorators import require_auth, require_role, require_PUT, require_DELETE
from is_kmp.utils.permissions import check_have_access_to_company
from is_kmp.utils.request_params import get_request_value_str, get_request_value_float


@require_GET
@require_auth
def get_it_projects(_, __, user_company_id, ___):
    it_projects = ITProject.objects.filter(
        company_id=user_company_id,
    ).order_by('start_date', 'id')

    result = []

    for it_project in it_projects:
        result.append({
            'id': it_project.pk,
            'name': it_project.name,
            'description': it_project.description,
            'purpose': it_project.purpose,
            'initiator': it_project.initiator,
            'leader': it_project.leader,
            'budget': convert_decimal(it_project.budget),
            'start_date': it_project.start_date,
            'end_date': it_project.end_date,
        })

    return {
        'it_projects': result,
    }


@require_POST
@require_role(ROLE_IT_SPECIALIST)
def create_it_project(request, _, user_company_id, __):
    name = get_request_value_str(request.POST, 'name', True)
    description = get_request_value_str(request.POST, 'description', True)
    purpose = get_request_value_str(request.POST, 'purpose', True)
    initiator = get_request_value_str(request.POST, 'initiator', True)
    leader = get_request_value_str(request.POST, 'leader', True)
    budget = get_request_value_float(request.POST, 'budget', True)
    start_date = get_request_value_str(request.POST, 'start_date', True)
    end_date = get_request_value_str(request.POST, 'end_date', True)

    it_project = ITProject()

    it_project.name = name
    it_project.description = description
    it_project.purpose = purpose
    it_project.initiator = initiator
    it_project.leader = leader
    it_project.budget = budget
    it_project.start_date = datetime.fromisoformat(start_date)
    it_project.end_date = datetime.fromisoformat(end_date)
    it_project.company_id = user_company_id

    it_project.save()

    return {
        'created_it_project': {
            'id': it_project.pk,
            'name': it_project.name,
            'description': it_project.description,
            'purpose': it_project.purpose,
            'initiator': it_project.initiator,
            'leader': it_project.leader,
            'budget': convert_decimal(it_project.budget),
            'start_date': it_project.start_date,
            'end_date': it_project.end_date,
        },
    }


@require_PUT
@require_role(ROLE_IT_SPECIALIST)
def update_it_project(request, _, user_company_id, user_roles, it_project_id: int):
    it_project = get_it_project_by_id_or_exception(it_project_id)

    check_have_access_to_company(user_company_id, it_project.company_id, user_roles)

    data, _ = MultiPartParser(request.META, request, request.upload_handlers).parse()

    name = get_request_value_str(data, 'name', True)
    description = get_request_value_str(data, 'description', True)
    purpose = get_request_value_str(data, 'purpose', True)
    initiator = get_request_value_str(data, 'initiator', True)
    leader = get_request_value_str(data, 'leader', True)
    budget = get_request_value_float(data, 'budget', True)
    start_date = get_request_value_str(data, 'start_date', True)
    end_date = get_request_value_str(data, 'end_date', True)

    it_project.name = name
    it_project.description = description
    it_project.purpose = purpose
    it_project.initiator = initiator
    it_project.leader = leader
    it_project.budget = budget
    it_project.start_date = datetime.fromisoformat(start_date)
    it_project.end_date = datetime.fromisoformat(end_date)

    it_project.save()

    return {
        'updated_it_project': {
            'id': it_project.pk,
            'name': it_project.name,
            'description': it_project.description,
            'purpose': it_project.purpose,
            'initiator': it_project.initiator,
            'leader': it_project.leader,
            'budget': convert_decimal(it_project.budget),
            'start_date': it_project.start_date,
            'end_date': it_project.end_date,
        },
    }


@require_DELETE
@require_role(ROLE_IT_SPECIALIST)
def delete_it_project(_, __, user_company_id, user_roles, it_project_id: int):
    it_project = get_it_project_by_id_or_exception(it_project_id)

    check_have_access_to_company(user_company_id, it_project.company_id, user_roles)

    it_project.delete()

    return 'OK'
