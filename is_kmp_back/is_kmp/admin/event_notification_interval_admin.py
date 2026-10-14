from django.contrib import admin

from is_kmp.models.event_notification_interval import EventNotificationInterval


@admin.register(EventNotificationInterval)
class EventNotificationIntervalAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
        'value',
        'value_type',
        'is_default',
    ]

    list_filter = [
        'value_type',
        'is_default',
    ]

    search_fields = [
        'id',
        'name',
    ]
