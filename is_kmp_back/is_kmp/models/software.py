from django.db import models

from is_kmp.models.software_class import SoftwareClass
from is_kmp.models.software_tag import SoftwareTag


class Software(models.Model):
    name = models.CharField(verbose_name='Название')
    description = models.TextField(verbose_name='Описание')
    art_number = models.CharField(verbose_name='Артикул ПО', blank=True, null=True)
    register_number = models.CharField(verbose_name='Код из реестра импортозамещения', blank=True, null=True)

    foreign_software_analogue = models.CharField(verbose_name='Зарубежный аналог', blank=True, null=True)
    foreign_software_analogue_manufacturer = models.CharField(
        verbose_name='Производитель зарубежного аналога',
        blank=True,
        null=True,
    )

    selfwritten = models.BooleanField(verbose_name='Самописное ПО')

    main_class = models.ForeignKey(
        SoftwareClass,
        on_delete=models.CASCADE,
        verbose_name='Основной класс ПО',
        related_name='main_class_software',
    )
    # TODO: Удалить потом после переноса в additional_classes
    classes = models.ManyToManyField(SoftwareClass, verbose_name='_Доп классы ПО_', related_name='software_delete')
    additional_classes = models.ManyToManyField(SoftwareClass, verbose_name='Доп классы ПО', related_name='software')
    tags = models.ManyToManyField(SoftwareTag, verbose_name='Теги ПО')

    is_software_complex = models.BooleanField(verbose_name='Является ПАК?', default=False)

    added_by = models.CharField(verbose_name='Кто добавил', default='ADMIN')
    updated_by = models.CharField(verbose_name='Кто обновил', default='ADMIN')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'ПО'
        verbose_name_plural = 'ПО'
        ordering = ['name']

    def to_dict(self):
        return {
            'id': self.pk,
            'name': self.name,
            'description': self.description,
            'art_number': self.art_number,
            'register_number': self.register_number,
            'foreign_software_analogue': self.foreign_software_analogue,
            'foreign_software_analogue_manufacturer': self.foreign_software_analogue_manufacturer,
            'main_class': {
                'id': self.main_class.pk,
                'name': self.main_class.name,
            } if self.main_class else None,
            'additional_classes': [{
                'id': c.pk,
                'name': c.name,
            } for c in self.additional_classes.all()],
            'tags': [{
                'id': t.pk,
                'name': t.name,
            } for t in self.tags.all()],
            'is_software_complex': self.is_software_complex,
        }
