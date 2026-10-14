from django.contrib import admin

from is_kmp.models.implementation_status_history import ImplementationStatusHistory


@admin.register(ImplementationStatusHistory)
class ImplementationStatusHistoryAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'company_software',
        'implementation_status',
        'added_date',
    ]

    search_fields = [
        'id',
        'company_software__company__name',
        'company_software__company__short_name',
        'implementation_status__name',
        'added_date',
    ]

    list_filter = [
        'company_software__company__short_name',
        'implementation_status',
    ]
