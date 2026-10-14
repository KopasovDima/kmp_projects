from django.db import models

from is_kmp.models.chat_message import ChatMessage


def attachment_path(instance, filename):
    return f'message_attachments/{instance.message.id}/{filename}'


class ChatMessageAttachment(models.Model):
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='attachments', verbose_name='Сообщение')

    file = models.FileField(upload_to=attachment_path, verbose_name='Вложение')
    filename = models.CharField(verbose_name='Название')
    mimetype = models.CharField(verbose_name='MIMETYPE')

    def __str__(self):
        return f'{self.file} ({self.message.id})'

    class Meta:
        verbose_name = 'Вложение сообщения'
        verbose_name_plural = 'Чаты - Вложения сообщений'
