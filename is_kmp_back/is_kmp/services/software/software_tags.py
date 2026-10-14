from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.software_tag import SoftwareTag


def get_software_tag_by_id_or_exception(software_tag_id: int):
    software_tag = get_software_tag_by_id(software_tag_id)
    if not software_tag:
        raise NotFoundException(f'Не найден тег ПО с id {software_tag_id}')
    return software_tag


def get_software_tag_by_id(software_tag_id: int):
    return SoftwareTag.objects.filter(id=software_tag_id).first()
