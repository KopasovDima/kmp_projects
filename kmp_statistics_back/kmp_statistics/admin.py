from django.contrib import admin

from kmp_statistics.models.call_statistics import CallStatistics
from kmp_statistics.models.department import Department
from kmp_statistics.models.redmine_statistics import RedmineStatistics
from kmp_statistics.models.statistics_1c import Statistics1C
from kmp_statistics.models.user import User
from kmp_statistics.models.zabbix_monitoring import ZabbixParameterMonitoring


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_editable = [
        'user_name',
    ]

    list_display = [
        'phone_number',
        'user_name',
    ]

    search_fields = [
        'phone_number',
        'user_name',
    ]


@admin.register(CallStatistics)
class CallStatisticsAdmin(admin.ModelAdmin):
    list_display = [
        'user',
        'contacting_number',
        'call_date',
        'duration',
        'answered',
        'call_type',
    ]

    list_filter = [
        'answered',
        'call_type',
    ]

    search_fields = [
        'user__phone_number',
        'user__user_name',
        'contacting_number',
        'call_date',
    ]


@admin.register(Statistics1C)
class Statistics1CAdmin(admin.ModelAdmin):
    list_display = [
        '_1c_department',
        '_1c_user',
        'year',
        'month',
        'parameter',
        'value',
    ]

    list_filter = [
        '_1c_department',
        '_1c_user',
        'year',
        'month',
        'parameter',
    ]


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_editable = [
        'name',
        'sprav_id',
    ]

    list_display = [
        '_1c_uuid',
        'sprav_id',
        'name',
    ]

    search_fields = [
        '_1c_uuid',
        'sprav_id',
        'name',
    ]


@admin.register(RedmineStatistics)
class RedmineStatisticsAdmin(admin.ModelAdmin):
    list_display = [
        'year',
        'month',
        'issue_id',
        'project_id',
        'project_name',
        'status_id',
        'status_name',
        'priority_id',
        'priority_name',
        'subject',
        'description',
        'start_date',
        'due_date',
        'created_on',
        'updated_on',
        'assigned_to_id',
        'assigned_to_name',
        'author_id',
        'author_name',
    ]

    search_fields = [
        'issue_id',
        'subject',
        'description',
    ]

    list_filter = [
        'year',
        'month',
        'project_name',
        'status_name',
        'priority_name',
        'assigned_to_name',
        'author_name',
    ]


@admin.register(ZabbixParameterMonitoring)
class ZabbixParameterMonitoringAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'zabbix_item_id',
        'zabbix_value_type',
        'history_timeline_length_sec',
        'update_interval_sec',
        'warning_value',
        'alarm_value',
    ]

    search_fields = [
        'name',
        'zabbix_item_id',
    ]
