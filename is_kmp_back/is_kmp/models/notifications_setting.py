from django.db import models


class NotificationsSetting(models.Model):
    name = models.CharField(verbose_name='Название')
    description = models.TextField(verbose_name='Описание')

    default_value = models.BooleanField(verbose_name='Значение по умолчанию', default=True)

    def __str__(self):
        return f'Настройка уведомлений - {self.name}'

    class Meta:
        verbose_name = 'Настройка уведомлений'
        verbose_name_plural = 'Настройки уведомлений'
