from django.contrib import admin

from is_kmp.models.budget_section_category import BudgetSectionCategory


@admin.register(BudgetSectionCategory)
class BudgetSectionCategoryAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
        'number',
        'section',
    ]

    list_filter = [
        'section',
    ]

    search_fields = [
        'name',
        'number',
        'section__name',
    ]
