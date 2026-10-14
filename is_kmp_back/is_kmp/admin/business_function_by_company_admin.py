from django.contrib import admin

from is_kmp.models.business_function_by_company import BusinessFunctionByCompany


class CompanySoftwareInline(admin.TabularInline):
    model = BusinessFunctionByCompany.company_software.through
    verbose_name = 'ПО Компании'
    verbose_name_plural = 'ПО Компании'


@admin.register(BusinessFunctionByCompany)
class BusinessFunctionByCompanyAdmin(admin.ModelAdmin):
    exclude = [
        'company_software',
    ]
    inlines = [
        CompanySoftwareInline,
    ]

    list_display = [
        'id',
        'company',
        'business_function',
        'value',
    ]

    list_filter = [
        'company',
        'business_function',
        'value',
    ]

    search_fields = [
        'company__name',
        'company__short_name',
        'business_function__name',
    ]
