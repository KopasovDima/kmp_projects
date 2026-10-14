from django.contrib import admin

from is_kmp.models.budget_section import BudgetSection


@admin.register(BudgetSection)
class BudgetSectionAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
    ]

    search_fields = [
        'name',
    ]
