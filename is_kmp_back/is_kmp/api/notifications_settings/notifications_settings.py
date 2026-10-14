from django.http.multipartparser import MultiPartParser
from django.views.decorators.http import require_GET

from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.notifications_setting import NotificationsSetting
from is_kmp.models.notifications_user_setting import NotificationsUserSetting
from is_kmp.utils.decorators import require_auth, require_PUT, check_remote_ip_allowed
from is_kmp.utils.request_params import get_request_value_bool, get_request_value_int


@require_GET
@require_auth
def get_notifications_settings(_, user_id, __, ___):
    all_notifications_count = NotificationsSetting.objects.count()
    user_notifications_count = NotificationsUserSetting.objects.filter(user_id=user_id).count()

    if all_notifications_count != user_notifications_count:
        existing_user_notifications = (
            NotificationsUserSetting.objects.
            filter(user_id=user_id).
            values_list('notifications_setting_id', flat=True)
        )
        notifications_settings_to_create = NotificationsSetting.objects.exclude(pk__in=existing_user_notifications)

        NotificationsUserSetting.objects.bulk_create([
            NotificationsUserSetting(
                user_id=user_id,
                notifications_setting=notification_setting,
                value=notification_setting.default_value,
            )
            for notification_setting in notifications_settings_to_create
        ])

    result = []

    for notification_user_setting in (
            NotificationsUserSetting.objects.filter(user_id=user_id).order_by('notifications_setting_id')
    ):
        result.append({
            'id': notification_user_setting.notifications_setting_id,
            'name': notification_user_setting.notifications_setting.name,
            'value': notification_user_setting.value,
            'description': notification_user_setting.notifications_setting.description,
        })

    return {
        'notifications_settings': result,
    }


@require_PUT
@require_auth
def set_notifications_user_settings_new_value(request, user_id, _, __, notifications_setting_id: int):
    data, _ = MultiPartParser(request.META, request, request.upload_handlers).parse()

    new_value = get_request_value_bool(data, 'new_value', True)

    notifications_user_setting = NotificationsUserSetting.objects.filter(
        notifications_setting_id=notifications_setting_id, user_id=user_id,
    ).first()

    if not notifications_user_setting:
        notifications_setting = NotificationsSetting.objects.filter(id=notifications_setting_id).first()

        if not notifications_setting:
            raise NotFoundException(f'Не найдена настройка уведомлений с id {notifications_setting_id}')

        notifications_user_setting = NotificationsUserSetting()
        notifications_user_setting.user_id = user_id
        notifications_user_setting.notifications_setting = notifications_setting

    notifications_user_setting.value = new_value

    notifications_user_setting.save()

    return {
        'id': notifications_setting_id,
        'value': new_value,
    }


@require_GET
@check_remote_ip_allowed
def check_notifications_setting_enabled(request, notifications_setting_id: int):
    user_id = get_request_value_int(request.GET, 'user_id', True)

    notifications_user_setting = NotificationsUserSetting.objects.filter(
        notifications_setting_id=notifications_setting_id, user_id=user_id,
    ).first()

    if notifications_user_setting:
        value = notifications_user_setting.value
    else:
        notifications_setting = NotificationsSetting.objects.filter(id=notifications_setting_id).first()

        if not notifications_setting:
            raise NotFoundException(f'Не найдена настройка уведомлений с id {notifications_setting_id}')

        value = notifications_setting.default_value

    return {
        'value': value,
    }
