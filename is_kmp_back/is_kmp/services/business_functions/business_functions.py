from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.business_function import BusinessFunction


def get_business_function_by_id_or_exception(business_function_id: int):
    business_function = get_business_function_by_id(business_function_id)
    if not business_function:
        raise NotFoundException(f'Не найдена БФ с id {business_function_id}')
    return business_function


def get_business_function_by_id(business_function_id: int):
    return BusinessFunction.objects.filter(id=business_function_id).first()
