from django.db import models

from is_kmp.models.order import Order


def attachment_path(instance, filename):
    return f'order_attachments/{instance.order.id}/{filename}'


class OrderAttachment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='attachments', verbose_name='Указания')

    file = models.FileField(upload_to=attachment_path, verbose_name='Вложение')
    filename = models.CharField(verbose_name='Название')
    mimetype = models.CharField(verbose_name='MIMETYPE')

    def __str__(self):
        return f'{self.file} ({self.order.id})'

    class Meta:
        verbose_name = 'Вложение'
        verbose_name_plural = 'Обязательные указания - Вложения'
