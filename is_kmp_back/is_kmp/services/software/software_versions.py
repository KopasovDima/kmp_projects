from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.software_version import SoftwareVersion


def get_software_version_by_id_or_exception(software_version_id: int):
    software_version = get_software_version_by_id(software_version_id)
    if not software_version:
        raise NotFoundException(f'Не найдена версия ПО с id {software_version_id}')
    return software_version


def get_software_version_by_id(software_version_id: int):
    return SoftwareVersion.objects.filter(id=software_version_id).first()
