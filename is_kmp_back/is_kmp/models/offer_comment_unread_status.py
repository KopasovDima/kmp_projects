from django.db import models

from is_kmp.models.offer_comment import OfferComment


class OfferCommentUnreadStatus(models.Model):
    comment = models.ForeignKey(
        OfferComment, on_delete=models.CASCADE, related_name='unread_statuses', verbose_name='Комментарий',
    )

    user_id = models.IntegerField(verbose_name='ID Пользователя (kmp_auth)')

    def __str__(self):
        return f'{self.comment} - {self.user_id}'

    class Meta:
        verbose_name = 'Статус прочтения комментария'
        verbose_name_plural = 'Предложения - Статусы прочтения комментариев'
