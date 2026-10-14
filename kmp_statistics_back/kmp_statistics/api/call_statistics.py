from django.db.models import Count, Sum, F
from django.db.models.functions import TruncMonth, TruncYear, TruncDay
from django.views.decorators.http import require_GET

from kmp_statistics.models.call_statistics import CallStatistics
from kmp_statistics.utils import external_services
from kmp_statistics.utils.decorators import handle_request

MONTH_NAMES = {
    1: 'Январь',
    2: 'Февраль',
    3: 'Март',
    4: 'Апрель',
    5: 'Май',
    6: 'Июнь',
    7: 'Июль',
    8: 'Август',
    9: 'Сентябрь',
    10: 'Октябрь',
    11: 'Ноябрь',
    12: 'Декабрь',
}


@require_GET
@handle_request
def get_call_statistics(request):
    year = request.GET.get('year', 2025)
    month = request.GET.get('month', '03')
    include_missing_calls = request.GET.get('include_missing_calls', 'true') == 'true'
    department_id = int(request.GET.get('department_id', '0'))
    call_type = request.GET.get('call_type')

    statistics = CallStatistics.objects.filter(call_date__month=month, call_date__year=year)

    if not include_missing_calls:
        statistics = statistics.filter(answered=True)

    if call_type:
        statistics = statistics.filter(call_type=call_type)

    if department_id:
        users = external_services.get_users(True)
        department_phones = [
            int(user.get('number')) for user in users if
            user.get('number') != '-' and department_id == user.get('department')
        ]
        statistics = statistics.filter(user__phone_number__in=department_phones)


    statistics = (
        statistics
        .annotate(month=TruncMonth('call_date'))
        .values('user__user_name')
        .annotate(call_count=Count('id'))
        .annotate(total_duration=Sum('duration'))
        .annotate(user_phone_number=F('user__phone_number'))
        .order_by('user__user_name')
    )
    result = []

    for stat in statistics:
        result.append({
            'user_name': stat['user__user_name'],
            'phone_number': stat['user_phone_number'],
            'count': stat['call_count'],
            'total_duration': stat['total_duration'],
        })

    return {
        'statistics': result,
    }


@require_GET
@handle_request
def get_call_statistics_by_user(request):
    year = request.GET.get('year', 2025)
    month = request.GET.get('month', '03')
    user_id = request.GET.get('user_phone_number')
    include_missing_calls = request.GET.get('include_missing_calls', 'true') == 'true'
    call_type = request.GET.get('call_type')

    if user_id is None:
        return {
            'status': 400,
            'error': 'Не указан номер телефона пользователя',
        }
    user_id = int(user_id)

    statistics = CallStatistics.objects.filter(call_date__month=month, call_date__year=year, user__phone_number=user_id)

    if not include_missing_calls:
        statistics = statistics.filter(answered=True)

    if call_type:
        statistics = statistics.filter(call_type=call_type)

    statistics = (
        statistics
        .annotate(day=TruncDay('call_date'))
        .values('day')
        .annotate(call_count=Count('id'))
        .annotate(total_duration=Sum('duration'))
        .order_by('day')
    )
    result = []

    for stat in statistics:
        result.append({
            'day': stat['day'].day,
            'count': stat['call_count'],
            'total_duration': stat['total_duration'],
        })

    return {
        'statistics': result,
    }


@require_GET
@handle_request
def get_call_statistics_periods(_):
    periods = (
        CallStatistics.objects
        .annotate(year=TruncYear('call_date'), month=TruncMonth('call_date'))
        .values('year', 'month')
        .distinct()
        .order_by('-year', '-month')
    )
    result = []

    for period in periods:
        year = period['year'].year
        month_code = period['month'].month
        result.append({
            'year': year,
            'month_code': month_code,
            'month_name': MONTH_NAMES[month_code],
        })

    return {
        'periods': result,
    }
