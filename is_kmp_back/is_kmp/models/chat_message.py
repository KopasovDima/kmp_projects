from django.db import models

from is_kmp.models.chat import Chat


class ChatMessage(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages', verbose_name='Чат')

    author_id = models.IntegerField(verbose_name='ID Автора (kmp_auth)')

    date = models.DateTimeField(verbose_name='Время', auto_now_add=True)
    text = models.TextField(verbose_name='Текст сообщения')

    parent_message = models.ForeignKey(
        'self', blank=True, null=True, on_delete=models.CASCADE, verbose_name='Ответ на сообщение',
    )

    def __str__(self):
        return f'{self.chat} ({self.date})'

    class Meta:
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Чаты - Сообщения'
