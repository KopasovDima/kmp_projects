from django.db import models

from is_kmp.models.budget_item import BudgetItem
from is_kmp.models.company import Company


class BudgetReport(models.Model):
    year = models.PositiveSmallIntegerField(verbose_name='Год')

    company = models.ForeignKey(Company, blank=True, null=True, on_delete=models.SET_NULL, related_name='budget_reports', verbose_name='Компания')

    budget_item = models.ForeignKey(BudgetItem, blank=True, null=True, on_delete=models.SET_NULL, related_name='reports', verbose_name='Элемент бюджета')

    value_quarter_1 = models.DecimalField(verbose_name='Квартал 1', max_digits=30, decimal_places=2)
    value_quarter_2 = models.DecimalField(verbose_name='Квартал 2', max_digits=30, decimal_places=2)
    value_quarter_3 = models.DecimalField(verbose_name='Квартал 3', max_digits=30, decimal_places=2)
    value_quarter_4 = models.DecimalField(verbose_name='Квартал 4', max_digits=30, decimal_places=2)

    fact_or_plan = models.CharField(choices=[('fact', 'fact'), ('plan', 'plan')], verbose_name='Факт/План')

    def __str__(self):
        return f'{self.company.name} {self.year}'

    class Meta:
        verbose_name = 'Бюджет'
        verbose_name_plural = 'Бюджет'
