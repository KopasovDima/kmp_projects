from django.db import models

from is_kmp.models.business_function import BusinessFunction
from is_kmp.models.company import Company
from is_kmp.models.software import Software
from is_kmp.models.company_software import CompanySoftware


class BusinessFunctionByCompany(models.Model):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='business_function_by_company',
        verbose_name='Компания',
    )

    business_function = models.ForeignKey(
        BusinessFunction,
        on_delete=models.CASCADE,
        related_name='business_function_by_company',
        verbose_name='Бизнес-функция',
    )

    software_usage_status = models.CharField(
        choices=[
            ('Используется без ПО', 'Используется без ПО'),
            ('Используется с российским ПО', 'Используется с российским ПО'),
            ('Используется с иностранным ПО', 'Используется с иностранным ПО'),
        ],
        verbose_name='Статус использования ПО',
        null=True,
        blank=True,
    )
    comment = models.TextField(verbose_name='Комментарий', default='')

    value = models.BooleanField(
        verbose_name='Значение',
        null=True,
        blank=True,
    )
    ftr = models.TextField(verbose_name='Функционально-технические требования', default='')
    reason = models.TextField(verbose_name='Обоснование выбора приоритета', default='')
    priority = models.CharField(
        choices=[
            ('1', '1'),
            ('2', '2'),
            ('3', '3'),
        ],
        verbose_name='Приоритет',
        null=True,
        blank=True,
    )
    ru_software_availability_status = models.CharField(
        choices=[
            ('0', 'Нет решений'),
            ('1', 'Необходима серьезная доработка решений'),
            ('2', 'Необходима доработка решений'),
            ('3', 'Российские решения закрывают критически важный функционал'),
        ],
        verbose_name='Наличие РФ-решений',
        null=True,
        blank=True,
    )

    target_software = models.ForeignKey(
        Software,
        verbose_name='Целевое ПО',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    company_software = models.ManyToManyField(CompanySoftware, verbose_name='ПО Компании')

    def __str__(self):
        return f'{self.company.short_name} - {self.business_function.name}'

    class Meta:
        verbose_name = 'Бизнес-функция компании'
        verbose_name_plural = 'Бизнес-функции компаний'
