from django.http.multipartparser import MultiPartParser
from django.views.decorators.http import require_GET, require_POST

from is_kmp.consts.roles import ROLE_IT_SPECIALIST
from is_kmp.exceptions.bad_request_exception import BadRequestException
from is_kmp.models.software import Software
from is_kmp.services.software.software import get_software_by_name, get_software_by_id_or_exception
from is_kmp.services.software.software_classes import get_software_class_by_id_or_exception
from is_kmp.services.software.software_tags import get_software_tag_by_id_or_exception
from is_kmp.utils.decorators import require_role, require_auth, require_PUT
from is_kmp.utils.request_params import get_request_value_str, get_request_value_list_int, get_request_value_bool, \
    get_request_value_int


@require_GET
@require_auth
def get_software(request, __, ___, ____):
    include_versions = get_request_value_bool(request.GET, 'include_versions')

    software = Software.objects.all()

    result = []

    for s in software:
        software_info = s.to_dict()

        if include_versions:
            software_info['versions'] = [
                {
                    'id': software_version.pk,
                    'version': software_version.version,
                }
                for software_version in s.versions.all()
            ]

        result.append(software_info)

    return {
        'software': result,
    }


@require_POST
@require_role(ROLE_IT_SPECIALIST)
def create_software(request, user_id, _, __):
    name = get_request_value_str(request.POST, 'name', True)
    description = get_request_value_str(request.POST, 'description', True)
    art_number = get_request_value_str(request.POST, 'art_number')
    register_number = get_request_value_str(request.POST, 'register_number')
    foreign_software_analogue = get_request_value_str(request.POST, 'foreign_software_analogue')
    foreign_software_analogue_manufacturer = get_request_value_str(
        request.POST,
        'foreign_software_analogue_manufacturer',
    )
    main_class_id = get_request_value_int(request.POST, 'main_class_id', True)
    additional_class_ids = get_request_value_list_int(request.POST, 'additional_class_ids') or []
    tag_ids = get_request_value_list_int(request.POST, 'tag_ids') or []
    is_software_complex = get_request_value_bool(request.POST, 'is_software_complex') or False

    existing_software = get_software_by_name(name)
    if existing_software:
        raise BadRequestException(f'ПО с названием {name} уже существует')

    if main_class_id in additional_class_ids:
        additional_class_ids = list(filter(lambda c: c != main_class_id, additional_class_ids))

    classes = {}
    for class_id in [main_class_id] + additional_class_ids:
        if class_id in classes:
            continue
        software_class = get_software_class_by_id_or_exception(class_id)
        if not software_class.parent:
            raise BadRequestException('Не допускается добавлять класс ПО первого уровня')
        classes[class_id] = software_class

    tags = {}
    for tag_id in tag_ids:
        if tag_id in tags:
            continue
        tags[tag_id] = get_software_tag_by_id_or_exception(tag_id)

    software = Software()

    software.name = name
    software.description = description
    software.art_number = art_number if art_number else ''
    software.register_number = register_number if register_number else ''
    software.foreign_software_analogue = foreign_software_analogue if foreign_software_analogue else ''
    software.foreign_software_analogue_manufacturer = (
        foreign_software_analogue_manufacturer if foreign_software_analogue_manufacturer else ''
    )
    software.main_class_id = main_class_id
    software.selfwritten = True

    software.is_software_complex = is_software_complex

    software.added_by = user_id
    software.updated_by = user_id

    software.save()

    try:
        del classes[main_class_id]
        if classes.values():
            software.additional_classes.add(*classes.values())
        if tags.values():
            software.tags.add(*tags.values())
        software.save()
    except Exception as e:
        software.delete()
        raise e

    return {
        'software': software.to_dict()
    }


@require_PUT
# TODO: Временно разрешить редактирование для ИТ-специалистов
# @require_role(ROLE_ADMIN)
@require_role(ROLE_IT_SPECIALIST)
def update_software(request, user_id, _, __, software_id: int):
    data, _ = MultiPartParser(request.META, request, request.upload_handlers).parse()

    name = get_request_value_str(data, 'name', True)
    description = get_request_value_str(data, 'description', True)
    art_number = get_request_value_str(data, 'art_number')
    register_number = get_request_value_str(data, 'register_number')
    foreign_software_analogue = get_request_value_str(data, 'foreign_software_analogue')
    foreign_software_analogue_manufacturer = get_request_value_str(
        data,
        'foreign_software_analogue_manufacturer',
    )
    new_main_class_id = get_request_value_int(data, 'main_class_id', True)
    new_additional_class_ids = get_request_value_list_int(data, 'additional_class_ids') or []
    new_tag_ids = get_request_value_list_int(data, 'tag_ids') or []
    is_software_complex = get_request_value_bool(data, 'is_software_complex') or False

    if new_main_class_id in new_additional_class_ids:
        new_additional_class_ids = list(filter(lambda c: c != new_main_class_id, new_additional_class_ids))

    software = get_software_by_id_or_exception(software_id)

    if software.name != name:
        existing_software = get_software_by_name(name)
        if existing_software:
            raise BadRequestException(f'ПО с названием {name} уже существует')

    additional_class_ids = set(software.additional_classes.values_list('id', flat=True))
    tag_ids = set(software.tags.values_list('id', flat=True))

    additional_class_ids_to_add = set(new_additional_class_ids) - additional_class_ids
    additional_class_ids_to_remove = additional_class_ids - set(new_additional_class_ids)

    tag_ids_to_add = set(new_tag_ids) - tag_ids
    tag_ids_to_remove = tag_ids - set(new_tag_ids)

    new_classes = {}
    for new_class_id in {new_main_class_id}.union(additional_class_ids_to_add):
        if new_class_id in new_classes:
            continue
        new_class = get_software_class_by_id_or_exception(new_class_id)
        if not new_class.parent:
            raise BadRequestException('Не допускается добавлять класс ПО первого уровня')
        new_classes[new_class_id] = new_class

    new_tags = {}
    for new_tag_id in tag_ids_to_add:
        if new_tag_id in new_tags:
            continue
        new_tags[new_tag_id] = get_software_tag_by_id_or_exception(new_tag_id)

    try:
        del new_classes[new_main_class_id]
        if new_classes:
            software.additional_classes.add(*new_classes.keys())
        if additional_class_ids_to_remove:
            software.additional_classes.remove(*additional_class_ids_to_remove)
        if new_tags:
            software.tags.add(*new_tags.keys())
        if tag_ids_to_remove:
            software.tags.remove(*tag_ids_to_remove)
    except Exception as e:
        raise e

    software.name = name
    software.description = description
    software.art_number = art_number if art_number else ''
    software.register_number = register_number if register_number else ''
    software.foreign_software_analogue = foreign_software_analogue if foreign_software_analogue else ''
    software.foreign_software_analogue_manufacturer = (
        foreign_software_analogue_manufacturer if foreign_software_analogue_manufacturer else ''
    )
    software.main_class_id = new_main_class_id
    software.selfwritten = True
    software.is_software_complex = is_software_complex

    software.updated_by = user_id

    software.save()

    return {
        'updated_software': software.to_dict(),
    }
