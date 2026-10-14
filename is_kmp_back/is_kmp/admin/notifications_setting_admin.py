from django.contrib import admin

from is_kmp.models.notifications_setting import NotificationsSetting


@admin.register(NotificationsSetting)
class NotificationsSettingAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
        'default_value',
    ]

    search_fields = [
        'id',
        'name',
    ]

    list_filter = [
        'default_value',
    ]
