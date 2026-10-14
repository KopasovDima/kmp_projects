from django.db import models


class Order(models.Model):
    name = models.CharField(verbose_name='Название')
    description = models.TextField(verbose_name='Описание')

    def __str__(self):
        return f'Обязательные указания: {self.name}'

    class Meta:
        verbose_name = 'Обязательные указания'
        verbose_name_plural = 'Обязательные указания'
