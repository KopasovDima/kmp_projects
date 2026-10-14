from django.db import models

from is_kmp.models.company_software import CompanySoftware
from is_kmp.models.implementation_status import ImplementationStatus


class ImplementationStatusHistory(models.Model):
    company_software = models.ForeignKey(
        CompanySoftware,
        related_name='implementation_status_history',
        on_delete=models.CASCADE,
        verbose_name='ПО Компании',
    )
    implementation_status = models.ForeignKey(
        ImplementationStatus,
        related_name='implementation_status_history',
        on_delete=models.CASCADE,
        verbose_name='Статус внедрения',
    )

    added_date = models.DateTimeField(verbose_name='', auto_now_add=True)

    def __str__(self):
        return f'{self.company_software} - {self.implementation_status}'

    class Meta:
        verbose_name = 'История статусов внедрения'
        verbose_name_plural = 'ПО - История статусов внедрения'
