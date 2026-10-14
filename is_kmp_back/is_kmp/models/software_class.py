from django.db import models


class SoftwareClass(models.Model):
    name = models.CharField(verbose_name='Название')
    number = models.CharField(verbose_name='Номер')
    parent = models.ForeignKey(
        'self',
        blank=True,
        null=True,
        on_delete=models.CASCADE,
        db_column='parent_id',
        verbose_name='Родительский класс ПО',
    )

    def __str__(self):
        return f'{self.name} ({self.number})'

    class Meta:
        verbose_name = 'Класс ПО'
        verbose_name_plural = 'ПО - Классы ПО'
        ordering = ['number']
