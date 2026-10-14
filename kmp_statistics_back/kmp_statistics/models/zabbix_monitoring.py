from django.db import models


class ZabbixParameterMonitoring(models.Model):
    name = models.CharField(verbose_name='Название')
    zabbix_item_id = models.IntegerField(verbose_name='ZabbixItemID')
    zabbix_value_type = models.IntegerField(verbose_name='Тип параметра в Zabbix')

    history_timeline_length_sec = models.IntegerField(verbose_name='Отображение исторических данных (секунды)')
    update_interval_sec = models.IntegerField(verbose_name='Интервал обновления данных (секунды)')

    parameter_intervals = models.TextField(
        verbose_name='Интервалы данных',
        help_text=(
            '''Значения параметра для круговой диаграммы указываются на отдельных строках:
             1) значение1
             2) значение2:#цвет1 - между текущим и предыдущим значением
             3) значение3:#цвет2 - между текущим и предыдущим значением
             '''
        ),
    )

    email_notify_list = models.TextField(
        verbose_name='Список рассылки уведомлений',
        help_text='Каждый email указывается на новой строке'
    )

    warning_value = models.IntegerField(verbose_name='Значение для отображения предупреждения')
    alarm_value = models.IntegerField(verbose_name='Значение для отображения тревоги')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Мониторинг Параметра Zabbix'
        verbose_name_plural = 'Мониторинг Параметров Zabbix'
        ordering = ['name']
