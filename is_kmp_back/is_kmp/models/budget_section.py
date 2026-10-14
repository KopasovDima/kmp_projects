from django.db import models


class BudgetSection(models.Model):
    name = models.CharField(verbose_name='Название')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Секция бюджета'
        verbose_name_plural = 'Бюджет - Секции бюджета'
