from django.urls import path

from kmp_statistics.api import call_statistics
from kmp_statistics.api import common_statistics
from kmp_statistics.api import departments
from kmp_statistics.api import redmine_statistics
from kmp_statistics.api import statistics_1c
from kmp_statistics.api import users
from kmp_statistics.api import zabbix

urlpatterns = [
    path('users/verify/', users.verify_users),
    path('users/1c_users/', users.get_1c_users),
    path('users/', users.get_users),

    path('departments/verify/', departments.verify_departments),
    path('departments/', departments.get_departments),

    path('1c_statistics/user/', statistics_1c.get_1c_statistics_by_user),
    path('1c_statistics/', statistics_1c.get_1c_statistics),

    path('call_statistics/periods/', call_statistics.get_call_statistics_periods),
    path('call_statistics/user/', call_statistics.get_call_statistics_by_user),
    path('call_statistics/', call_statistics.get_call_statistics),

    path('redmine_statistics/common/', redmine_statistics.get_redmine_common_statistics),
    path('redmine_statistics/periods/', redmine_statistics.get_redmine_statistics_periods),
    path('redmine_statistics/persons/', redmine_statistics.get_redmine_statistics_persons),
    path('redmine_statistics/', redmine_statistics.get_redmine_statistics),

    path('common_statistics/', common_statistics.get_common_statistics),

    # Zabbix stats
    path('zabbix_statistics/monitoring_params/<int:monitoring_id>/values/', zabbix.get_zabbix_monitoring_values),
    path('zabbix_statistics/monitoring_params/', zabbix.get_zabbix_monitoring_params),
    path('zabbix_statistics/hosts/<str:hostid>/items/', zabbix.get_host_items),
    path('zabbix_statistics/hosts/', zabbix.get_hosts),
    path('zabbix_statistics/history/', zabbix.get_history_data),
    path('zabbix_statistics/trend/', zabbix.get_trend_data),
]
