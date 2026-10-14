from django.contrib import admin

from is_kmp.models.company import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
        'short_name',
        'status',
        'level',
        'level_comment',
        'org_type',
        'address',
        'address_fact',
        'inn',
        'parent',
    ]

    list_filter = [
        'level',
        'status',
        'org_type',
        'parent__short_name',
    ]

    search_fields = [
        'name',
        'short_name',
        'address',
        'address_fact',
        'inn',
        'parent__name',
        'parent__short_name',
    ]
