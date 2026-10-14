from django.contrib import admin

from is_kmp.models.company_software import CompanySoftware
from is_kmp.models.software_version import SoftwareVersion


class SoftwareVersionsInline(admin.TabularInline):
    model = CompanySoftware.software_versions.through
    verbose_name = 'Версия ПО'
    verbose_name_plural = 'Версии ПО'

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'softwareversion':
            company_software_id = request.resolver_match.kwargs.get('object_id')
            company_software = CompanySoftware.objects.filter(pk=company_software_id or 0).first()

            if company_software:
                software_id = company_software.software_id
                kwargs['queryset'] = SoftwareVersion.objects.filter(software_id=software_id)

        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(CompanySoftware)
class CompanySoftwareAdmin(admin.ModelAdmin):
    exclude = [
        'software_versions',
    ]
    inlines = [
        SoftwareVersionsInline,
    ]

    list_display = [
        'id',
        'software',
        'company',
        'comment',
        'copies_number',
        'additionally_needed_copies_number',
        'implementation_status',
    ]

    search_fields = [
        'id',
        'software__name',
        'company__name',
        'company__short_name',
    ]

    list_filter = [
        'software__name',
        'company__short_name',
    ]
