from django.db import models

from is_kmp.consts.notifications import INTERVAL_MINUTES_TITLE, INTERVAL_MINUTES_MULTIPLIER, INTERVAL_HOURS_TITLE, \
    INTERVAL_HOURS_MULTIPLIER, INTERVAL_DAYS_MULTIPLIER, INTERVAL_DAYS_TITLE


class EventNotificationInterval(models.Model):
    name = models.CharField(verbose_name='Название')
    value = models.PositiveIntegerField(verbose_name='Значение', default=1)
    value_type = models.PositiveBigIntegerField(
        verbose_name='Тип значения',
        choices=[
            (INTERVAL_MINUTES_MULTIPLIER, INTERVAL_MINUTES_TITLE),
            (INTERVAL_HOURS_MULTIPLIER, INTERVAL_HOURS_TITLE),
            (INTERVAL_DAYS_MULTIPLIER, INTERVAL_DAYS_TITLE),
        ],
    )
    is_default = models.BooleanField(verbose_name='Использовать по умолчанию', default=False)

    def __str__(self):
        return f'Интервал уведомления - {self.name}'

    class Meta:
        verbose_name = 'Интервал уведомления'
        verbose_name_plural = 'Мероприятия - Интервалы уведомлений'
        ordering = ['-value_type', '-value', '-name']
