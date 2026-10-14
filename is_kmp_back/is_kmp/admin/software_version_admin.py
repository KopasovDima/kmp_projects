from django.contrib import admin

from is_kmp.models.software_version import SoftwareVersion


@admin.register(SoftwareVersion)
class SoftwareVersionAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'software',
        'version',
    ]

    search_fields = [
        'id',
        'version',
    ]

    list_filter = [
        'software',
    ]
