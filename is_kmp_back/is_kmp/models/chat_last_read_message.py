from django.db import models

from is_kmp.models.chat import Chat
from is_kmp.models.chat_message import ChatMessage


class ChatLastReadMessage(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='last_read_messages', verbose_name='Чат')
    user_id = models.IntegerField(verbose_name='ID Пользователя (kmp_auth)')

    message = models.ForeignKey(
        ChatMessage, on_delete=models.CASCADE, related_name='last_read_messages', verbose_name='Сообщение',
    )

    def __str__(self):
        return f'{self.chat} - {self.user_id}'

    class Meta:
        verbose_name = 'Последнее прочитанное сообщение'
        verbose_name_plural = 'Чаты - Последние прочитанные сообщения'
