from django.db import models

from is_kmp.models.company import Company
from is_kmp.models.implementation_status import ImplementationStatus
from is_kmp.models.software import Software
from is_kmp.models.software_version import SoftwareVersion


class CompanySoftware(models.Model):
    software = models.ForeignKey(
        Software,
        related_name='company_software',
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        verbose_name='ПО',
    )
    company = models.ForeignKey(
        Company,
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        related_name='company_software',
        verbose_name='Компания',
    )
    comment = models.TextField(verbose_name='Комментарий', blank=True, null=True)

    copies_number = models.PositiveIntegerField(verbose_name='Количество копий')
    additionally_needed_copies_number = models.PositiveIntegerField(verbose_name='Дополнительно требуемое количесвто копий')

    implementation_status = models.ForeignKey(
        ImplementationStatus,
        related_name='company_software',
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        verbose_name='Статус внедрения',
    )

    software_versions = models.ManyToManyField(SoftwareVersion, verbose_name='Версии ПО')

    def __str__(self):
        return f'{self.company} - {self.software}'

    class Meta:
        verbose_name = 'ПО Компании'
        verbose_name_plural = 'ПО Компании'
