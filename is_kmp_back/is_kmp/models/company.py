from django.db import models


class Company(models.Model):
    name = models.CharField(verbose_name='Название')
    short_name = models.CharField(verbose_name='Краткое название')
    status = models.CharField(verbose_name='Статус')
    level = models.SmallIntegerField(verbose_name='Уровень')
    level_comment = models.CharField(blank=True, null=True, verbose_name='Комментарий к уровню')

    org_type = models.CharField(verbose_name='Тип организации')
    address = models.CharField(verbose_name='Адрес')
    address_fact = models.CharField(verbose_name='Фактический адрес')
    inn = models.CharField(verbose_name='ИНН')

    logo_url = models.CharField(verbose_name='Логотип', blank=True, null=True, default='')

    parent = models.ForeignKey(
        'self', blank=True, null=True, on_delete=models.CASCADE,
        db_column='parent_id', verbose_name='Родительская компания',
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Компания'
        verbose_name_plural = 'Компании'
