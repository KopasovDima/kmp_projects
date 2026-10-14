from django.db import models

from is_kmp.models.offer import Offer
from is_kmp.models.offer_comment import OfferComment


class OfferLastReadComment(models.Model):
    offer = models.ForeignKey(
        Offer, on_delete=models.CASCADE, related_name='last_read_comments', verbose_name='Предложение',
    )
    user_id = models.IntegerField(verbose_name='ID Пользователя (kmp_auth)')

    comment = models.ForeignKey(
        OfferComment, on_delete=models.CASCADE, related_name='last_read_comments', verbose_name='Комментарий',
    )

    def __str__(self):
        return f'{self.offer} - {self.user_id}'

    class Meta:
        verbose_name = 'Последний прочитанный комментарий'
        verbose_name_plural = 'Предложения - Последние прочитанные комментарии'
