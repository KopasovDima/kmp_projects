from django.db import models


class ImplementationStatus(models.Model):
    name = models.CharField(verbose_name='Название')
    color = models.CharField(verbose_name='Цвет в HTML-разметке')
    border = models.CharField(verbose_name='Граница в HTML-разметке', blank=True, null=True)
    ordering_number = models.IntegerField(verbose_name='Порядок сортировки')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Статус внедрения'
        verbose_name_plural = 'ПО - Статусы внедрения'
