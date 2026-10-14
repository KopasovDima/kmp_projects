from django.db import models


class ChatParticipant(models.Model):
    user_id = models.IntegerField(verbose_name='ID Пользователя (kmp_auth)')

    def __str__(self):
        return f'Участник чата с USER ID - {self.user_id}'

    class Meta:
        verbose_name = 'Участник'
        verbose_name_plural = 'Чаты - Участники'
