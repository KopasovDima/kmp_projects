from django.db import models

from is_kmp.models.chat_message import ChatMessage


class ChatMessageUnreadStatus(models.Model):
    message = models.ForeignKey(
        ChatMessage, on_delete=models.CASCADE, related_name='unread_statuses', verbose_name='Сообщение',
    )

    user_id = models.IntegerField(verbose_name='ID Пользователя (kmp_auth)')

    def __str__(self):
        return f'{self.message} - {self.user_id}'

    class Meta:
        verbose_name = 'Непрочитанные сообщения'
        verbose_name_plural = 'Чаты - Непрочитанные сообщения'
