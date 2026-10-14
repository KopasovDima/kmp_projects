from django.db import models

from is_kmp.models.offer import Offer


def attachment_path(instance, filename):
    return f'offer_attachments/{instance.offer.id}/{filename}'


class OfferAttachment(models.Model):
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='attachments', verbose_name='Предложение')

    file = models.FileField(upload_to=attachment_path, verbose_name='Вложение')
    filename = models.CharField(verbose_name='Название')
    mimetype = models.CharField(verbose_name='MIMETYPE')

    def __str__(self):
        return f'{self.file} ({self.offer.id})'

    class Meta:
        verbose_name = 'Вложение'
        verbose_name_plural = 'Предложения - Вложения'
