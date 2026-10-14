from django.db import models


class BusinessFunctionHistory(models.Model):
    business_function_id = models.IntegerField(verbose_name='ID бизнес-функция')

    action_type = models.CharField(
        choices=[
            ('created', 'Создан'), ('deleted', 'Удалён'),
            ('updated', 'Изменён'), ('changed_order', 'Изменена сортировка'),
        ],
        verbose_name='Тип действия',
    )

    changed_by_user = models.IntegerField(verbose_name='Изменено пользователем')

    changes = models.TextField(verbose_name='Изменения')

    added = models.DateTimeField(verbose_name='Дата добавления', auto_now_add=True)

    def __str__(self):
        return f'{self.business_function_id} {self.action_type}'

    class Meta:
        verbose_name = 'Бизнес-функция - История изменения'
        verbose_name_plural = 'Бизнес-функции - История изменения'
