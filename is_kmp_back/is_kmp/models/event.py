from django.db import models


class Event(models.Model):
    name = models.CharField(verbose_name='Название')
    description = models.CharField(verbose_name='Описание', blank=True, null=True)
    start_date = models.DateTimeField(verbose_name='Время начала')
    end_date = models.DateTimeField(verbose_name='Время окончания', blank=True, null=True)
    link = models.CharField(verbose_name='Ссылка на ВКС', blank=True, null=True)
    color = models.CharField(verbose_name='Цвет', default='#A2C5E4')

    author_id = models.IntegerField(verbose_name='ID Автора (kmp_auth)')

    def __str__(self):
        return f'{self.name} ({self.start_date})'

    class Meta:
        verbose_name = 'Мероприятие'
        verbose_name_plural = 'Мероприятия'
