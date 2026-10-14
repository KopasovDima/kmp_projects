from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from django.views.decorators.http import require_GET

from kmp_statistics.models.call_statistics import CallStatistics
from kmp_statistics.models.redmine_statistics import RedmineStatistics
from kmp_statistics.models.statistics_1c import Statistics1C
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
def get_common_statistics(request):
    year = request.GET.get('year', 2025)
    department_uuid = request.GET.get('department_uuid')
    department_id = int(request.GET.get('department_id', '0'))
    include_redmine = request.GET.get('include_redmine') == 'true'

    call_result = []

    statistics = CallStatistics.objects.filter(answered=True, call_date__year=year)

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
        .values('month')
        .annotate(call_count=Count('id'))
        .order_by('month')
    )

    for call_stat in statistics:
        month_code = call_stat['month'].month
        call_result.append({
            'type': 'Звонки',
            'month_code': month_code,
            'month_name': MONTH_NAMES[month_code],
            'value': call_stat['call_count']
        })

    redmine_result = {}

    if include_redmine and (not department_uuid or department_uuid == '55782fa2-ad50-11ed-9585-000c29accef6'):
        statistics = (
            RedmineStatistics.objects
            .filter(year=year)
            .values('month')
            .annotate(issues_count=Count('id'))
            .order_by('month')
        )

        for redmine_stat in statistics:
            redmine_result[redmine_stat['month']] = redmine_stat['issues_count']

    _1c_result = []

    statistics = Statistics1C.objects.filter(year=year, parameter='КоличествоПодзадачПоДепартаментам')

    if department_uuid:
        statistics = statistics.filter(_1c_department___1c_uuid=department_uuid)
    else:
        statistics = statistics.filter(_1c_department__isnull=False)

    statistics = (
        statistics
        .values('month')
        .annotate(ussues_1c_count=Sum('value'))
        .order_by('month')
    )

    for _1c_stat in statistics:
        month_code = _1c_stat['month']

        redmine_value = redmine_result[month_code] if month_code in redmine_result else 0

        _1c_result.append({
            'type': '1C',
            'month_code': month_code,
            'month_name': MONTH_NAMES[month_code],
            'value': _1c_stat['ussues_1c_count'] + redmine_value,
        })

    return {
        '1c_statistics': _1c_result,
        'call_statistics': call_result,
    }
