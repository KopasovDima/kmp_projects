from django.contrib import admin

from is_kmp.models.implementation_status import ImplementationStatus


@admin.register(ImplementationStatus)
class ImplementationStatusAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
        'color',
        'border',
        'ordering_number',
    ]

    search_fields = [
        'id',
        'name',
    ]
