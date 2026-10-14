from django.contrib import admin

from is_kmp.models.software import Software


class AdditionalClassesInline(admin.TabularInline):
    model = Software.additional_classes.through
    verbose_name = 'Доп класс ПО'
    verbose_name_plural = 'Доп классы ПО'


class TagsInline(admin.TabularInline):
    model = Software.tags.through
    verbose_name = 'Тег ПО'
    verbose_name_plural = 'Теги ПО'


@admin.register(Software)
class SoftwareAdmin(admin.ModelAdmin):
    exclude = [
        'additional_classes',
        'tags',
    ]
    inlines = [
        AdditionalClassesInline,
        TagsInline,
    ]

    list_display = [
        'id',
        'name',
        'description',
        'art_number',
        'register_number',
        'foreign_software_analogue',
        'foreign_software_analogue_manufacturer',
        'main_class',
        # 'selfwritten',
        'is_software_complex',
        'added_by',
    ]

    search_fields = [
        'id',
        'name',
        'description',
        'art_number',
        'register_number',
        'foreign_software_analogue',
        'foreign_software_analogue_manufacturer',
        'added_by',
    ]

    # list_filter = [
    #     'selfwritten',
    # ]
