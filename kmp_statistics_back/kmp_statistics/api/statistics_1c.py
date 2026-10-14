from django.db.models import Sum
from django.views.decorators.http import require_GET

from kmp_statistics.models.statistics_1c import Statistics1C
from kmp_statistics.utils.decorators import handle_request


@require_GET
@handle_request
def get_1c_statistics(request):
    department_uuid = request.GET.get('department_uuid')
    parameter = request.GET.get('parameter')
    statistics = Statistics1C.objects.all()

    if parameter:
        statistics = statistics.filter(parameter=parameter)

    if department_uuid:
        statistics = statistics.filter(_1c_department___1c_uuid=department_uuid).order_by('year', 'month', 'parameter')
    else:
        statistics = (
            statistics
            .filter(_1c_department__isnull=False)
            .values('year', 'month', 'parameter')
            .annotate(value=Sum('value'))
            .order_by('year', 'month', 'parameter')
        )

    result = []

    for stat in statistics:
        if department_uuid:
            value = {
                'time': f'{stat.month if stat.month >= 10 else ("0" + str(stat.month))}-{stat.year}',
                'parameter': stat.parameter,
                'value': stat.value,
                'department': stat._1c_department.name,
            }
        else:
            value = {
                'time': f'{stat.get("month") if stat.get("month") >= 10 else ("0" + str(stat.get("month")))}-{stat.get("year")}',
                'parameter': stat.get('parameter'),
                'value': stat.get('value'),
            }
        result.append(value)

    return {
        'statistics': result,
    }


@require_GET
@handle_request
def get_1c_statistics_by_user(request):
    user_name = request.GET.get('user_name')

    if not user_name:
        return {
            'status': 400,
            'message': 'Не указано имя пользователя',
        }

    statistics = (
        Statistics1C.objects
        .filter(parameter='КоличествоПодзадачПоИсполнителям')
        .filter(_1c_user=user_name)
        .values('year', 'month', 'parameter')
        .annotate(value=Sum('value'))
        .order_by('year', 'month')
    )

    result = []

    for stat in statistics:
        value = {
            'time': f'{stat.get("month") if stat.get("month") >= 10 else ("0" + str(stat.get("month")))}-{stat.get("year")}',
            'parameter': stat.get('parameter'),
            'value': stat.get('value'),
        }
        result.append(value)

    return {
        'statistics': result,
    }
