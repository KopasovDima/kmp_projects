from django.db import models

from is_kmp.models.notifications_setting import NotificationsSetting


class NotificationsUserSetting(models.Model):
    notifications_setting = models.ForeignKey(
        NotificationsSetting, verbose_name='Настройка уведомлений', on_delete=models.CASCADE,
        related_name='user_settings',
    )
    user_id = models.IntegerField(verbose_name='ID Пользователя (kmp_auth)')
    value = models.BooleanField(verbose_name='Значение', default=True)

    def __str__(self):
        return f'Пользовательская настройка уведомления - {self.user_id} - {self.notifications_setting}'

    class Meta:
        verbose_name = 'Настройка уведомлений пользователя'
        verbose_name_plural = 'Настройки уведомлений пользователей'
