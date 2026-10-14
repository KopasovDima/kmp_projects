from django.db import models

from is_kmp.models.offer import Offer


class OfferComment(models.Model):
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='comments', verbose_name='Предложение')

    author_id = models.IntegerField(verbose_name='ID Автора (kmp_auth)')

    date = models.DateTimeField(verbose_name='Время', auto_now_add=True)
    text = models.TextField(verbose_name='Текст комментария')

    parent_comment = models.ForeignKey(
        'self', blank=True, null=True, on_delete=models.CASCADE, verbose_name='Ответ на комментарий',
    )

    def __str__(self):
        return f'Комментарий на предложение ({self.offer}): {self.text[:30]} / {self.date}'

    class Meta:
        verbose_name = 'Комментарий'
        verbose_name_plural = 'Предложения - Комментарии'
