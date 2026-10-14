from django.contrib import admin

from is_kmp.models.notifications_user_setting import NotificationsUserSetting


@admin.register(NotificationsUserSetting)
class NotificationsUserSettingAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'notifications_setting',
        'user_id',
        'value',
    ]

    search_fields = [
        'id',
        'notifications_setting',
    ]

    list_filter = [
        'user_id',
        'value',
    ]
