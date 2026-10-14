from django.db import models

from is_kmp.models.budget_section import BudgetSection


class BudgetSectionCategory(models.Model):
    name = models.CharField(verbose_name='Название')
    number = models.CharField(verbose_name='Номер')

    section = models.ForeignKey(BudgetSection, blank=True, null=True, on_delete=models.CASCADE, related_name='categories', verbose_name='Секция бюджета')

    def __str__(self):
        return f'{self.number} - {self.name}'

    class Meta:
        verbose_name = 'Категория бюджета'
        verbose_name_plural = 'Бюджет - Категории бюджета'
