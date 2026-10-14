from django.db import models


class SoftwareTag(models.Model):
    name = models.CharField(verbose_name='Название')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Тег ПО'
        verbose_name_plural = 'ПО - Теги ПО'
