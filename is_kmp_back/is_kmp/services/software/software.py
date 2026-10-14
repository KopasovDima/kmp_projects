from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.software import Software


def get_software_by_id_or_exception(software_id: int):
    software = get_software_by_id(software_id)
    if not software:
        raise NotFoundException(f'Не найдено ПО с id {software_id}')
    return software


def get_software_by_id(software_id: int):
    return Software.objects.filter(id=software_id).first()


def get_software_by_name(software_name: str):
    return Software.objects.filter(name=software_name).first()
