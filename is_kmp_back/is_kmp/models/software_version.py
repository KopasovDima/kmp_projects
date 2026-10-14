from django.db import models

from is_kmp.models.software import Software


class SoftwareVersion(models.Model):
    software = models.ForeignKey(Software, on_delete=models.CASCADE, verbose_name='ПО', related_name='versions')
    version = models.CharField(verbose_name='Версия')

    def __str__(self):
        return f'{self.software} - {self.version}'

    class Meta:
        verbose_name = 'Версия ПО'
        verbose_name_plural = 'ПО - Версии ПО'
        ordering = ['software', 'version']
