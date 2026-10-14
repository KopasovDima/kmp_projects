from django.views.decorators.http import require_GET

from is_kmp.models.software_class import SoftwareClass
from is_kmp.utils.decorators import require_auth


@require_GET
@require_auth
def get_classes(_, __, ___, ____):
    software_classes = SoftwareClass.objects.filter(parent__isnull=False).order_by('number')

    result = []

    for software_class in software_classes:
        software_class_info = {
            'id': software_class.pk,
            'name': software_class.name,
            'number': software_class.number,
        }

        if software_class.parent and software_class.parent_id != software_class.pk:
            software_class_info['parent'] = {
                'id': software_class.parent.id,
                'name': software_class.parent.name,
                'number': software_class.parent.number,
            }

        result.append(software_class_info)

    return {
        'software_classes': result,
    }
