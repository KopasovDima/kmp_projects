from django.http.multipartparser import MultiPartParser

from is_kmp.exceptions.bad_request_exception import BadRequestException


def get_patch_request_data(source):
    try:
        data, _ = MultiPartParser(source.META, source, source.upload_handlers).parse()
    except (Exception,):
        data = {}
    return data


def get_request_value_str(source, name: str, required: bool = False):
    value = source.get(name)

    if not value and required:
        raise BadRequestException(f'Не указан параметр {name}')

    return value.strip() if value else value


def get_request_value_int(source, name: str, required: bool = False):
    value = get_request_value_str(source, name, required)

    try:
        value = int(value)
    except (Exception,):
        if value:
            raise BadRequestException(f'Неверный формат числа ({value}) для параметра: {name}')

    return value


def get_request_value_float(source, name: str, required: bool = False):
    value = get_request_value_str(source, name, required)

    try:
        value = float(value)
    except (Exception,):
        if value:
            raise BadRequestException(f'Неверный формат дробного числа ({value}) для параметра: {name}')

    return value


def get_request_value_list_str(source, name: str, required: bool = False):
    value = get_request_value_str(source, name, required)

    return value.split(',') if value else None


def get_request_value_list_int(source, name: str, required: bool = False):
    values = get_request_value_list_str(source, name, required)

    if not values:
        return None

    result = []

    value = ''

    try:
        for value in values:
            result.append(int(value))
    except (Exception,):
        raise BadRequestException(f'Неверный формат числа ({value}) для параметра: {name}')

    return result


def get_request_value_bool(source, name: str, required: bool = False):
    return get_request_value_str(source, name, required) == 'true'
