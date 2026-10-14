from django.db import models

from is_kmp.models.event_notification_interval import EventNotificationInterval
from is_kmp.models.event_participant import EventParticipant


class EventParticipantNotification(models.Model):
    event_participant = models.ForeignKey(
        EventParticipant, verbose_name='Участник мероприятия', on_delete=models.CASCADE, related_name='notifications',
    )
    interval = models.ForeignKey(EventNotificationInterval, verbose_name='Интервал', on_delete=models.CASCADE)
    date = models.DateTimeField(verbose_name='Время уведомления')
    completed = models.BooleanField(verbose_name='Отправлено?', default=False)

    def __str__(self):
        return f'Уведомление участника - {self.event_participant} - {self.interval.name}'

    class Meta:
        verbose_name = 'Уведомление участника мероприятия'
        verbose_name_plural = 'Мероприятия - Уведомления участников мероприятия'
