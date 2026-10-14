from django.db import models

from is_kmp.models.chat_participant import ChatParticipant


class Chat(models.Model):
    name = models.CharField(verbose_name='Название чата', blank=True, null=True)
    participants = models.ManyToManyField(ChatParticipant, related_name='chats')
    is_group = models.BooleanField(default=False)

    author_id = models.IntegerField(verbose_name='ID Автора (kmp_auth)', blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True, verbose_name='Создано')

    def __str__(self):
        if self.is_group:
            return f'Групповой чат: {self.name}'
        return f'Чат {self.participants.all()[0]} / {self.participants.all()[1]}'

    class Meta:
        verbose_name = 'Чат'
        verbose_name_plural = 'Чаты'
