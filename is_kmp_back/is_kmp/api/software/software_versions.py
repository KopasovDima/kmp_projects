from django.db.models.functions import Lower
from django.views.decorators.http import require_GET, require_POST

from is_kmp.consts.roles import ROLE_IT_SPECIALIST
from is_kmp.exceptions.bad_request_exception import BadRequestException
from is_kmp.models.software_version import SoftwareVersion
from is_kmp.services.software.software import get_software_by_id_or_exception
from is_kmp.utils.decorators import require_role
from is_kmp.utils.request_params import get_request_value_str


@require_GET
@require_role(ROLE_IT_SPECIALIST)
def get_software_versions(_, __, ___, ____, software_id: int):
    software_versions = SoftwareVersion.objects.filter(software_id=software_id).order_by('version')

    result = []

    for software_version in software_versions:
        result.append({
            'id': software_version.pk,
            'version': software_version.version,
        })

    return {
        'software_versions': result,
    }


@require_POST
@require_role(ROLE_IT_SPECIALIST)
def add_software_version(request, __, ___, ____, software_id: int):
    version = get_request_value_str(request.POST, 'version', True)

    software = get_software_by_id_or_exception(software_id)

    existing_version = (
        SoftwareVersion.objects
        .annotate(version_lower=Lower('version'))
        .filter(software_id=software_id, version_lower=version.lower())
    ).first()

    if existing_version:
        raise BadRequestException('Данная версия уже добавлена к этому ПО')

    software_version = SoftwareVersion()

    software_version.software = software
    software_version.version = version

    software_version.save()

    return {
        'id': software_version.pk,
        'version': software_version.version,
    }
