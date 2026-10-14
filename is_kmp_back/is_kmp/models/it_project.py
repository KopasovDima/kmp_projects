from django.db import models

from is_kmp.models.company import Company


class ITProject(models.Model):
    name = models.CharField(verbose_name='Название')
    description = models.TextField(verbose_name='Описание')
    purpose = models.TextField(verbose_name='Цель')
    initiator = models.CharField(verbose_name='Инициатор')
    leader = models.CharField(verbose_name='Лидер')
    budget = models.DecimalField(verbose_name='Бюджет', default=0, max_digits=30, decimal_places=2)
    start_date = models.DateField(verbose_name='Дата начала')
    end_date = models.DateField(verbose_name='Дата окончания')

    company = models.ForeignKey(
        Company, blank=True, null=True, on_delete=models.SET_NULL, related_name='it_projects',
        verbose_name='Компания',
    )

    def __str__(self):
        return f'{self.name}'

    class Meta:
        verbose_name = 'ИТ Проект'
        verbose_name_plural = 'ИТ Проекты'
