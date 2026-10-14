from django.db import models

from is_kmp.models.company import Company
from is_kmp.models.purchase_type import PurchaseType


class Purchase(models.Model):
    year = models.PositiveSmallIntegerField(verbose_name='Год')

    company = models.ForeignKey(
        Company, blank=True, null=True, on_delete=models.SET_NULL,
        related_name='purchases', verbose_name='Компания',
    )

    name = models.CharField(verbose_name='Название')
    volume = models.IntegerField(verbose_name='Объём')
    cost = models.DecimalField(verbose_name='Стоимость', max_digits=30, decimal_places=2)

    purchase_type = models.ForeignKey(
        PurchaseType, blank=True, null=True, on_delete=models.SET_NULL,
        related_name='purchases', verbose_name='Тип закупки',
    )

    start_date = models.DateField(verbose_name='Дата начала')
    end_date = models.DateField(verbose_name='Дата окончания')

    initiator = models.CharField(verbose_name='Инициатор', blank=True, null=True)
    initiator_department = models.CharField(verbose_name='Подразделение инициатор', blank=True, null=True)
    purchase_number = models.CharField(verbose_name='Номер плана закупки', blank=True, null=True)
    protocol_date = models.DateField(verbose_name='Дата протокола ЗК', blank=True, null=True)
    protocol_number = models.CharField(verbose_name='Номер протокола', blank=True, null=True)
    protocol_date_final = models.DateField(verbose_name='Дата начала', blank=True, null=True)
    protocol_number_final = models.CharField(verbose_name='Дата начала', blank=True, null=True)
    purchase_method = models.CharField(verbose_name='Способ закупки', blank=True, null=True)
    volume_unit = models.CharField(verbose_name='Ед измерения', blank=True, null=True)
    requests_number = models.IntegerField(verbose_name='Количество заявок', blank=True, null=True)
    confirmed_requests_number = models.IntegerField(verbose_name='Количество допущенных заявок', blank=True, null=True)
    supplier_name = models.CharField(verbose_name='Поставщик', blank=True, null=True)
    supplier_inn = models.CharField(verbose_name='ИНН поставщика', blank=True, null=True)
    supplier_cost = models.DecimalField(
        verbose_name='Стоимость поставщика', blank=True, null=True,
        max_digits=30, decimal_places=2,
    )
    product_type = models.CharField(verbose_name='Тип продукта', blank=True, null=True)
    supplier_type = models.CharField(verbose_name='Тип поставщика', blank=True, null=True)
    agreement_number = models.CharField(verbose_name='Номер договора', blank=True, null=True)
    agreement_date = models.CharField(verbose_name='Дата договора', blank=True, null=True)
    register_month = models.CharField(verbose_name='Месяц внесения в реестр', blank=True, null=True)
    register_number = models.CharField(verbose_name='Номер реестровой записи', blank=True, null=True)
    comment = models.CharField(verbose_name='Примечание', blank=True, null=True)

    def __str__(self):
        return f'{self.company} - {self.year} - {self.name}'

    class Meta:
        verbose_name = 'Закупка'
        verbose_name_plural = 'Закупки'
