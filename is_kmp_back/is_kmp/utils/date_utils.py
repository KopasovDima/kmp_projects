from datetime import datetime
from django.utils import timezone


def convert_str_to_date(date: str):
    return datetime.strptime(date[:10], '%Y-%m-%d')


def get_date_with_start_daytime(date: str | datetime):
    if type(date) == str:
        date = convert_str_to_date(date)
    return timezone.make_aware(datetime.combine(date, datetime.min.time()))


def get_date_with_end_daytime(date: str | datetime):
    if type(date) == str:
        date = convert_str_to_date(date)
    return timezone.make_aware(datetime.combine(date, datetime.max.time()))
