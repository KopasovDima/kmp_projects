from django.contrib import admin

from is_kmp.models.budget_report import BudgetReport


@admin.register(BudgetReport)
class BudgetReportAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'year',
        'company',
        'budget_item',
        'value_quarter_1',
        'value_quarter_2',
        'value_quarter_3',
        'value_quarter_4',
        'fact_or_plan',
    ]

    search_fields = [
        'id',
        'budget_item__name',
    ]

    list_filter = [
        'year',
        'company',
        'fact_or_plan',
    ]
