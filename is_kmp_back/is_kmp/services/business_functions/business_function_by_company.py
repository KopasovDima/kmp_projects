from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.business_function_by_company import BusinessFunctionByCompany


def get_business_function_by_company_by_id_or_exception(business_function_by_company_id: int):
    business_function_by_company = get_business_function_by_company_by_id(business_function_by_company_id)
    if not business_function_by_company:
        raise NotFoundException(f'Не найдена БФ Компании с id {business_function_by_company_id}')
    return business_function_by_company


def get_business_function_by_company_by_id(business_function_by_company_id: int):
    return BusinessFunctionByCompany.objects.filter(id=business_function_by_company_id).first()
