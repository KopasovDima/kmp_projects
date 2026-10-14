import datetime

from django.views.decorators.http import require_GET
from zabbix_utils import ZabbixAPI

from config.env import env
from kmp_statistics.models.zabbix_monitoring import ZabbixParameterMonitoring
from kmp_statistics.utils.decorators import handle_request
from kmp_statistics.utils.request_params import get_request_value_str, get_request_value_int

zabbix_api = ZabbixAPI(url=env.ZABBIX_API)
zabbix_api.login(token=env.ZABBIX_API_KEY)


@require_GET
@handle_request
def get_hosts(_):
    hosts = zabbix_api.host.get()
    hosts = sorted(hosts, key=lambda x: x['name'].lower())
    return {
        'hosts': [{
            'hostid': host.get('hostid'),
            'name': host.get('name'),
            'description': host.get('description'),
        } for host in hosts]
    }


@require_GET
@handle_request
def get_host_items(_, hostid: str):
    host_items = zabbix_api.item.get(hostids=[hostid])
    host_items = sorted(host_items, key=lambda x: x['name'].lower())
    return {
        'items': [{
            'itemid': host_item.get('itemid'),
            'name': host_item.get('name'),
            'delay': host_item.get('delay'),
            'history': host_item.get('history'),
            'trends': host_item.get('trends'),
            'value_type': host_item.get('value_type'),
            'units': host_item.get('units'),
            'description': host_item.get('description'),
            'lastvalue': host_item.get('lastvalue'),
        } for host_item in host_items]
    }


def get_timestamp(date: datetime.datetime):
    return int(datetime.datetime.timestamp(date))


def convert_value_based_on_type(value: str, value_type: str):
    if value_type == '0':
        return float(value)
    elif value_type == '3':
        return int(value)
    return value


@require_GET
@handle_request
def get_history_data(request):
    itemid = get_request_value_str(request.GET, 'itemid', 'Не указан id элемента')
    start_date = get_request_value_str(request.GET, 'start_date', 'Не указана начальная дата')
    end_date = get_request_value_str(request.GET, 'end_date', 'Не указана конечная дата')
    value_type = get_request_value_str(request.GET, 'value_type', 'Не тип значения статистики')

    start_date = datetime.datetime.fromisoformat(start_date)
    end_date = datetime.datetime.fromisoformat(end_date)

    history_data = zabbix_api.history.get(
        itemids=[itemid],
        time_from=get_timestamp(start_date),
        time_till=get_timestamp(end_date),
        limit=1_000_000,
        history=value_type,
    )

    return {
        'values': [{
            'value': convert_value_based_on_type(history_item.get('value'), value_type),
            'date': datetime.datetime.fromtimestamp(int(history_item.get('clock'))),
        } for history_item in history_data]
    }


@require_GET
@handle_request
def get_trend_data(request):
    itemid = get_request_value_str(request.GET, 'itemid', 'Не указан id элемента')
    start_date = get_request_value_str(request.GET, 'start_date', 'Не указана начальная дата')
    end_date = get_request_value_str(request.GET, 'end_date', 'Не указана конечная дата')

    start_date = datetime.datetime.fromisoformat(start_date)
    end_date = datetime.datetime.fromisoformat(end_date)

    trend_data = zabbix_api.trend.get(
        itemids=[itemid],
        time_from=get_timestamp(start_date),
        time_till=get_timestamp(end_date),
        limit=1_000_000,
    )

    return {
        'values': [{
            'value': convert_value_based_on_type(trend_value.get('value_avg'), '0'),
            'date': datetime.datetime.fromtimestamp(int(trend_value.get('clock'))),
        } for trend_value in trend_data]
    }


@require_GET
@handle_request
def get_zabbix_monitoring_params(request):
    zabbix_monitoring_id = get_request_value_int(request.GET, 'zabbix_monitoring_id')

    zabbix_monitoring_params = ZabbixParameterMonitoring.objects.all()

    if zabbix_monitoring_id:
        zabbix_monitoring_params = zabbix_monitoring_params.filter(pk=zabbix_monitoring_id)

    return {
        'zabbix_monitoring': [
            {
                'id': zm.id,
                'name': zm.name,
                'zabbix_item_id': zm.zabbix_item_id,
                'zabbix_value_type': zm.zabbix_value_type,
                'history_timeline_length_sec': zm.history_timeline_length_sec,
                'update_interval_sec': zm.update_interval_sec,
                'parameter_intervals': [
                    {
                        'value': int(interval.strip().split(':')[0]),
                        'color': interval.strip().split(':')[-1] if ':' in interval else None,
                    }
                    for interval in zm.parameter_intervals.split('\n') if interval
                ],
                'warning_value': zm.warning_value,
                'alarm_value': zm.alarm_value,
            } for zm in zabbix_monitoring_params
        ],
    }


@require_GET
@handle_request
def get_zabbix_monitoring_values(_, monitoring_id: int):
    zabbix_monitoring_params = ZabbixParameterMonitoring.objects.filter(pk=monitoring_id).first()

    if not zabbix_monitoring_params:
        raise Exception(f'Не найден мониторинг параметра Zabbix с id: {monitoring_id}')

    end_date = datetime.datetime.now()
    start_date = end_date - datetime.timedelta(seconds=zabbix_monitoring_params.history_timeline_length_sec)

    history_data = zabbix_api.history.get(
        itemids=[zabbix_monitoring_params.zabbix_item_id],
        time_from=get_timestamp(start_date),
        time_till=get_timestamp(end_date),
        limit=1_000_000,
        history=zabbix_monitoring_params.zabbix_value_type,
    )

    return {
        'values': [{
            'value': convert_value_based_on_type(history_item.get('value'), str(zabbix_monitoring_params.zabbix_value_type)),
            'date': datetime.datetime.fromtimestamp(int(history_item.get('clock'))),
        } for history_item in history_data]
    }
