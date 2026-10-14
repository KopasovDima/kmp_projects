from django.db import models


class PurchaseType(models.Model):
    name = models.CharField(verbose_name='Название')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Тип закупки'
        verbose_name_plural = 'Закупки - Типы закупок'
