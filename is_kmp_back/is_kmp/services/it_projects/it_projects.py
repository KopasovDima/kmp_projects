from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.it_project import ITProject


def get_it_project_by_id_or_exception(it_project_id: int):
    it_project = get_it_project_by_id(it_project_id)
    if not it_project:
        raise NotFoundException(f'Не найден ИТ Проект с id {it_project_id}')
    return it_project


def get_it_project_by_id(it_project_id: int):
    return ITProject.objects.filter(id=it_project_id).first()
