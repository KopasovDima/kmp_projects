def convert_decimal(number: float | None):
    if number is None:
        return None

    if str(number).endswith('.00'):
        return int(str(number)[:-3])

    return float(number)
