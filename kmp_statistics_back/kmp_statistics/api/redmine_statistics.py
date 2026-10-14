import datetime

from django.db.models import Count, F
from django.views.decorators.http import require_GET

from kmp_statistics.models.redmine_statistics import RedmineStatistics
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
def get_redmine_common_statistics(request):
    year = request.GET.get('year', 2025)

    statistics = (
        RedmineStatistics.objects
        .filter(year=year)
        .values('month')
        .annotate(issues_count=Count('id'))
        .order_by('month')
    )

    redmine_result = []

    for redmine_stat in statistics:
        month_code = redmine_stat['month']
        redmine_result.append({
            'type': 'Redmine',
            'month_code': month_code,
            'month_name': MONTH_NAMES[month_code],
            'value': redmine_stat['issues_count']
        })

    return {
        'redmine_statistics': redmine_result,
    }


@require_GET
@handle_request
def get_redmine_statistics(request):
    year = int(request.GET.get('year'))
    month = request.GET.get('month')
    issue_status = request.GET.get('issue_status')
    person_type = request.GET.get('person_type', 'author')
    person_name = request.GET.get('person_name')

    statistics = RedmineStatistics.objects.all()

    if year:
        statistics = statistics.filter(year=year)

    if month:
        statistics = statistics.filter(month=month)

    if issue_status:
        statistics = statistics.filter(status_name=issue_status)

    if person_type == 'author':
        group_by = 'author_name'
        if person_name:
            statistics = statistics.filter(author_name=person_name)
    elif person_type == 'assigned_to':
        group_by = 'assigned_to_name'
        if person_name:
            statistics = statistics.filter(assigned_to_name=person_name)
    else:
        return {
            'status': 400,
            'error': 'Неизвестный тип человека для группировки'
        }

    statistics = (
        statistics
        .values(group_by)
        .annotate(issues_count=Count('issue_id'))
        .annotate(year=F('year'))
        .annotate(month=F('month'))
        .order_by(group_by, 'year', 'month')
    )
    result = []

    for stat in statistics:
        result.append({
            'year': stat['year'],
            'month': stat['month'],
            group_by: stat[group_by],
            'issues_count': stat['issues_count'],
        })

    if year and not month:
        current_year = datetime.datetime.now().year
        current_month = datetime.datetime.now().month
        group_by_values = {stat_result[group_by] for stat_result in result}

        for group_by_value in group_by_values:
            existing_months = {stat_result['month'] for stat_result in result if
                               stat_result[group_by] == group_by_value}

            for month in range(1, 13):
                if current_year == year and month > current_month:
                    continue
                if month not in existing_months:
                    result.append({
                        'year': year,
                        group_by: group_by_value,
                        'month': month,
                        'issues_count': 0,
                    })

    result = sorted(result, key=lambda x: x['month'])

    return {
        'statistics': result,
    }


@require_GET
@handle_request
def get_redmine_statistics_periods(_):
    periods = (
        RedmineStatistics.objects
        .values('year', 'month')
        .distinct()
        .order_by('-year', '-month')
    )
    result = []

    for period in periods:
        year = period['year']
        month_code = period['month']
        result.append({
            'year': year,
            'month_code': month_code,
            'month_name': MONTH_NAMES[month_code],
        })

    return {
        'periods': result,
    }


@require_GET
@handle_request
def get_redmine_statistics_persons(_):
    authors = (
        RedmineStatistics.objects
        .values('author_name')
        .distinct()
    )

    assigned_to = (
        RedmineStatistics.objects
        .values('assigned_to_name')
        .distinct()
    )

    result = []

    for person in authors:
        if not person['author_name']:
            continue
        result.append(person['author_name'])

    for person in assigned_to:
        if not person['assigned_to_name']:
            continue
        if person['assigned_to_name'] in result:
            continue
        result.append(person['assigned_to_name'])

    return {
        'persons': sorted(result),
    }
