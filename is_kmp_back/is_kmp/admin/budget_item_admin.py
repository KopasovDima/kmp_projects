from django.contrib import admin

from is_kmp.models.budget_item import BudgetItem


@admin.register(BudgetItem)
class BudgetItemAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
        'section_category',
    ]

    search_fields = [
        'name',
        'section_category__name',
        'section_category__number',
    ]

    list_filter = [
        'section_category',
    ]
