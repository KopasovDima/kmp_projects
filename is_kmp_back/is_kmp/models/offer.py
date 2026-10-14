from django.db import models


class Offer(models.Model):
    name = models.CharField(verbose_name='Название')
    description = models.TextField(verbose_name='Описание')
    offer_company = models.CharField(verbose_name='От компании')

    def __str__(self):
        return f'Предложение от компании ({self.offer_company}): {self.name}'

    class Meta:
        verbose_name = 'Предложение'
        verbose_name_plural = 'Предложения'
