from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.implementation_status import ImplementationStatus


def get_implementation_status_by_id_or_exception(implementation_status_id: int):
    implementation_status = get_implementation_status_by_id(implementation_status_id)
    if not implementation_status:
        raise NotFoundException(f'Не найден статус внедрения с id {implementation_status_id}')
    return implementation_status


def get_implementation_status_by_id(implementation_status_id: int):
    return ImplementationStatus.objects.filter(id=implementation_status_id).first()
