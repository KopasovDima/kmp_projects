from django.db import models


class Role(models.Model):
    identifier = models.CharField(primary_key=True, verbose_name='Идентификатор')
    name = models.CharField(verbose_name='Название')

    def __str__(self):
        return f'{self.identifier}/{self.name}'

    class Meta:
        verbose_name = 'Роль'
        verbose_name_plural = 'Роли'
