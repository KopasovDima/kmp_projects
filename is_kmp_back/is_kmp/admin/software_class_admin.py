from django.contrib import admin
from import_export.admin import ImportExportModelAdmin

from is_kmp.models.software_class import SoftwareClass


@admin.register(SoftwareClass)
class SoftwareClassAdmin(ImportExportModelAdmin):
    list_display = [
        'id',
        'name',
        'number',
        'parent',
    ]

    search_fields = [
        'id',
        'name',
        'number',
        'parent',
    ]
