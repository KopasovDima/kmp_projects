def get_request_value_str(source, name: str, required_error: str = None):
    value = source.get(name)

    if not value and required_error:
        raise Exception(required_error)

    return value


def get_request_value_int(source, name: str, required_error: str = None):
    value = get_request_value_str(source, name, required_error)

    try:
        value = int(value)
    except (Exception,):
        if value:
            raise Exception(f'Неверный формат числа ({value}) для параметра: {name}')

    return value


def get_request_value_list_str(source, name: str, required_error: str = None):
    value = get_request_value_str(source, name, required_error)

    return value.split(',') if value else None


def get_request_value_list_int(source, name: str, required_error: str = None):
    values = get_request_value_list_str(source, name, required_error)

    if not values:
        return None

    result = []

    value = ''

    try:
        for value in values:
            result.append(int(value))
    except (Exception,):
        raise Exception(f'Неверный формат числа ({value}) для параметра: {name}')

    return result
