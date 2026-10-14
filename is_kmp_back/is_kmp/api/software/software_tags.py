from django.views.decorators.http import require_GET

from is_kmp.models.software_tag import SoftwareTag
from is_kmp.utils.decorators import require_auth


@require_GET
@require_auth
def get_tags(_, __, ___, ____):
    software_tags = SoftwareTag.objects.all()

    result = []

    for software_tag in software_tags:
        result.append({
            'id': software_tag.pk,
            'name': software_tag.name,
        })

    return {
        'software_tags': result,
    }
