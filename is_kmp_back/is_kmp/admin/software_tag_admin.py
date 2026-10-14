from django.contrib import admin

from is_kmp.models.software_tag import SoftwareTag


@admin.register(SoftwareTag)
class SoftwareTagAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
    ]

    search_fields = [
        'id',
        'name',
    ]
