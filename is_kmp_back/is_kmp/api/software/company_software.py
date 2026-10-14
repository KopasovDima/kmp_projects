from django.db.models import Q
from django.http.multipartparser import MultiPartParser
from django.views.decorators.http import require_GET, require_POST

from is_kmp.consts.roles import ROLE_IT_SPECIALIST
from is_kmp.exceptions.bad_request_exception import BadRequestException
from is_kmp.models.company_software import CompanySoftware
from is_kmp.models.implementation_status_history import ImplementationStatusHistory
from is_kmp.models.software_class import SoftwareClass
from is_kmp.services.software.company_software import get_company_software_by_id_or_exception
from is_kmp.services.software.implementation_statuses import get_implementation_status_by_id_or_exception
from is_kmp.services.software.software import get_software_by_id_or_exception
from is_kmp.services.software.software_versions import get_software_version_by_id_or_exception
from is_kmp.utils.decorators import require_auth, require_role, require_DELETE, require_PUT
from is_kmp.utils.permissions import check_have_access_to_company
from is_kmp.utils.request_params import get_request_value_str, get_request_value_int, get_request_value_list_int


@require_GET
@require_auth
def get_company_software(_, __, user_company_id, ___):
    company_software = CompanySoftware.objects.filter(company_id=user_company_id).order_by('software__name', 'id')

    result = []

    for cs in company_software:
        result.append({
            'id': cs.pk,
            'software': cs.software.to_dict(),
            'comment': cs.comment,
            'copies_number': cs.copies_number,
            'additionally_needed_copies_number': cs.additionally_needed_copies_number,
            'implementation_status': {
                'id': cs.implementation_status.id,
                'name': cs.implementation_status.name,
                'color': cs.implementation_status.color,
                'border': cs.implementation_status.border,
            } if cs.implementation_status else None,
            'versions': [{
                'id': version.pk,
                'version': version.version,
            } for version in cs.software_versions.all()],
        })

    return {
        'company_software': result,
    }


@require_GET
@require_auth
def get_company_software_by_classes(_, __, user_company_id, ___):
    software_classes = SoftwareClass.objects.filter(parent__isnull=False)

    result = []

    for software_class in software_classes:
        company_software = (
            CompanySoftware.objects
            .filter(company_id=user_company_id)
            .filter(Q(software__main_class=software_class.pk) | Q(software__additional_classes__in=[software_class.pk]))
            .distinct()
            .order_by('software__name')
        )

        if not len(company_software):
            continue

        result.append({
            'id': software_class.pk,
            'name': software_class.name,
            'number': software_class.number,
            'software': [{
                'id': cs.pk,
                'software': {
                    'id': cs.software.pk,
                    'name': cs.software.name,
                }
            } for cs in company_software]
        })

    return {
        'company_software_by_classes': result,
    }


@require_POST
@require_role(ROLE_IT_SPECIALIST)
def add_company_software(request, _, user_company_id, __):
    software_id = get_request_value_int(request.POST, 'software_id', True)
    comment = get_request_value_str(request.POST, 'comment')
    implementation_status_id = get_request_value_int(request.POST, 'implementation_status_id', True)
    copies_number = get_request_value_int(request.POST, 'copies_number') or 0
    additionally_needed_copies_number = get_request_value_int(request.POST, 'additionally_needed_copies_number') or 0
    software_version_ids = get_request_value_list_int(request.POST, 'software_version_ids') or []

    software = get_software_by_id_or_exception(software_id)
    implementation_status = get_implementation_status_by_id_or_exception(implementation_status_id)

    existing_company_software = CompanySoftware.objects.filter(company_id=user_company_id, software_id=software_id)
    if len(existing_company_software):
        raise BadRequestException(f'ПО с id {software_id} уже добавлено. Повторное добавление невозможно')

    software_versions = {}
    for software_version_id in software_version_ids:
        if software_version_id in software_versions:
            continue
        software_version = get_software_version_by_id_or_exception(software_version_id)
        if software_version.software_id != software_id:
            raise BadRequestException('Не допускается добавлять версию ПО от другого ПО')
        software_versions[software_version_id] = software_version

    company_software = CompanySoftware()

    company_software.company_id = user_company_id
    company_software.software = software
    company_software.comment = comment
    company_software.copies_number = copies_number
    company_software.additionally_needed_copies_number = additionally_needed_copies_number
    company_software.implementation_status = implementation_status

    company_software.save()

    try:
        if software_versions.values():
            company_software.software_versions.add(*software_versions.values())
            company_software.save()
    except Exception as e:
        company_software.delete()
        raise e

    implementation_status_history = ImplementationStatusHistory()

    implementation_status_history.implementation_status = implementation_status
    implementation_status_history.company_software = company_software

    implementation_status_history.save()

    return {
        'company_software': {
            'id': company_software.pk,
            'software': company_software.software.to_dict(),
            'comment': company_software.comment,
            'copies_number': company_software.copies_number,
            'additionally_needed_copies_number': company_software.additionally_needed_copies_number,
            'implementation_status': {
                'id': company_software.implementation_status.id,
                'name': company_software.implementation_status.name,
                'color': company_software.implementation_status.color,
                'border': company_software.implementation_status.border,
            } if company_software.implementation_status else None,
            'versions': [{
                'id': version.pk,
                'version': version.version,
            } for version in company_software.software_versions.all()],
        },
    }


@require_PUT
@require_role(ROLE_IT_SPECIALIST)
def update_company_software(request, _, user_company_id, user_roles, company_software_id: int):
    data, _ = MultiPartParser(request.META, request, request.upload_handlers).parse()
    comment = get_request_value_str(data, 'comment')
    implementation_status_id = get_request_value_int(data,'implementation_status_id', True)
    copies_number = get_request_value_int(data, 'copies_number') or 0
    additionally_needed_copies_number = get_request_value_int(data, 'additionally_needed_copies_number') or 0
    software_version_ids = get_request_value_list_int(data, 'software_version_ids') or []

    company_software = get_company_software_by_id_or_exception(company_software_id)
    implementation_status = get_implementation_status_by_id_or_exception(implementation_status_id)

    check_have_access_to_company(user_company_id, company_software.company_id, user_roles)

    if implementation_status_id != company_software.implementation_status_id:
        implementation_status_history = ImplementationStatusHistory()

        implementation_status_history.implementation_status = implementation_status
        implementation_status_history.company_software = company_software

        implementation_status_history.save()

    company_software.comment = comment
    company_software.implementation_status = implementation_status
    company_software.copies_number = copies_number
    company_software.additionally_needed_copies_number = additionally_needed_copies_number

    company_software_version_ids = set(company_software.software_versions.values_list('id', flat=True))

    software_version_ids_to_add = set(software_version_ids) - company_software_version_ids
    software_version_ids_to_remove = company_software_version_ids - set(software_version_ids)

    new_software_versions = {}
    for new_software_version_id in software_version_ids_to_add:
        if new_software_version_id in new_software_versions:
            continue
        new_software_version = get_software_version_by_id_or_exception(new_software_version_id)
        if new_software_version.software_id != company_software.software_id:
            raise BadRequestException('Не допускается добавлять версию ПО от другого ПО')
        new_software_versions[new_software_version_id] = new_software_version

    try:
        if new_software_versions:
            company_software.software_versions.add(*new_software_versions.keys())
        if software_version_ids_to_remove:
            company_software.software_versions.remove(*software_version_ids_to_remove)
    except Exception as e:
        raise e

    company_software.save()

    return {
        'company_software': {
            'id': company_software.pk,
            'software': company_software.software.to_dict(),
            'comment': company_software.comment,
            'copies_number': company_software.copies_number,
            'additionally_needed_copies_number': company_software.additionally_needed_copies_number,
            'implementation_status': {
                'id': company_software.implementation_status.id,
                'name': company_software.implementation_status.name,
                'color': company_software.implementation_status.color,
                'border': company_software.implementation_status.border,
            } if company_software.implementation_status else None,
            'versions': [{
                'id': version.pk,
                'version': version.version,
            } for version in company_software.software_versions.all()],
        },
    }


@require_DELETE
@require_role(ROLE_IT_SPECIALIST)
def delete_company_software(_, __, user_company_id, user_roles, company_software_id: int):
    company_software = get_company_software_by_id_or_exception(company_software_id)

    check_have_access_to_company(user_company_id, company_software.company_id, user_roles)

    company_software.delete()

    return 'ОК'
