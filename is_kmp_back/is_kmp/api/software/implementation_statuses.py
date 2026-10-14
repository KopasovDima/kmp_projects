from django.views.decorators.http import require_GET

from is_kmp.models.implementation_status import ImplementationStatus
from is_kmp.utils.decorators import require_auth


@require_GET
@require_auth
def get_implementation_statuses(_, __, ___, ____):
    implementation_statuses = ImplementationStatus.objects.all().order_by('ordering_number', 'id')

    result = []

    for implementation_status in implementation_statuses:
        result.append({
            'id': implementation_status.pk,
            'name': implementation_status.name,
            'color': implementation_status.color,
        })

    return {
        'implementation_statuses': result,
    }
