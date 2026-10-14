from django.contrib import admin
from import_export.admin import ImportExportModelAdmin

from is_kmp.models.business_function import BusinessFunction


@admin.register(BusinessFunction)
class BusinessFunctionAdmin(ImportExportModelAdmin):
    list_display = [
        'id',
        'name',
        'level',
        'parent',
        'last_update',
        'sorting_order',
        'is_deleted',
    ]

    list_filter = [
        'level',
        'parent',
        'is_deleted',
    ]

    search_fields = [
        'name',
    ]
