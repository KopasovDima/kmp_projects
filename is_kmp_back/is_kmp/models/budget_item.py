from django.db import models

from is_kmp.models.budget_section_category import BudgetSectionCategory


class BudgetItem(models.Model):
    name = models.CharField(verbose_name='Название')

    section_category = models.ForeignKey(BudgetSectionCategory, blank=True, null=True, on_delete=models.CASCADE, related_name='items', verbose_name='Категория бюджета')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Элемент бюджета'
        verbose_name_plural = 'Бюджет - Элементы бюджета'
