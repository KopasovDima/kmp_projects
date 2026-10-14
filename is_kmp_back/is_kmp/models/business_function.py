import datetime

from django.db import models


class BusinessFunction(models.Model):
    name = models.CharField(verbose_name='Название')
    level = models.SmallIntegerField(verbose_name='Уровень')

    parent = models.ForeignKey(
        'self',
        blank=True,
        null=True,
        on_delete=models.CASCADE,
        db_column='parent_id',
        verbose_name='Родительская бизнес-функция',
    )

    ftr_example = models.TextField(verbose_name='Пример ФТТ', default='')
    priority_example = models.CharField(
        choices=[
            ('1', '1'),
            ('2', '2'),
            ('3', '3'),
        ],
        verbose_name='Пример приоритета',
        null=True,
        blank=True,
    )
    reason_example = models.TextField(verbose_name='Пример обоснования выбора приоритета', default='')

    sorting_order = models.IntegerField(default=0, verbose_name='Порядок сортировки')

    last_update = models.DateTimeField(verbose_name='Изменено', auto_now=True)
    is_deleted = models.BooleanField(verbose_name='Скрытое удаление', default=False)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Бизнес-функция'
        verbose_name_plural = 'Бизнес-функции'
        ordering = ['id']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.update_parents_last_update()

    def update_parents_last_update(self):
        parent = self.parent
        while parent:
            BusinessFunction.objects.filter(id=parent.id).update(last_update=datetime.datetime.now())
            parent = parent.parent
