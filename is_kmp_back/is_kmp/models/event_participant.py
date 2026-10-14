from django.db import models

from is_kmp.models.company import Company
from is_kmp.models.event import Event


class EventParticipant(models.Model):
    user_id = models.IntegerField(blank=True, null=True, verbose_name='ID пользователя (kmp_auth)')
    company = models.ForeignKey(Company, blank=True, null=True, verbose_name='Компания участник', on_delete=models.CASCADE)

    event = models.ForeignKey(Event, blank=True, null=True, on_delete=models.CASCADE, verbose_name='Мероприятие', related_name='participants')

    hidden = models.BooleanField(default=False, verbose_name='Скрытый участник?')

    def __str__(self):
        if self.user_id:
            return f'Мероприятие - {self.event.name}, ID пользователя - {self.user_id}'
        if self.company:
            return f'Мероприятие - {self.event.name}, компания - {self.company}'
        return f'Мероприятие - {self.event}'

    class Meta:
        verbose_name = 'Участник мероприятия'
        verbose_name_plural = 'Мероприятия - Участники мероприятия'
