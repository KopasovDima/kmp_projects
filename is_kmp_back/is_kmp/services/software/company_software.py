from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.company_software import CompanySoftware


def get_company_software_by_id_or_exception(company_software_id: int):
    company_software = get_company_software_by_id(company_software_id)
    if not company_software:
        raise NotFoundException(f'Не найдено ПО компании с id {company_software_id}')
    return company_software


def get_company_software_by_id(company_software_id: int):
    return CompanySoftware.objects.filter(id=company_software_id).first()
