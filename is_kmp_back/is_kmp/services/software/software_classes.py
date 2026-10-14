from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.software_class import SoftwareClass


def get_software_class_by_id_or_exception(software_class_id: int):
    software_class = get_software_class_by_id(software_class_id)
    if not software_class:
        raise NotFoundException(f'Не найден класс ПО с id {software_class_id}')
    return software_class


def get_software_class_by_id(software_class_id: int):
    return SoftwareClass.objects.filter(id=software_class_id).first()
