from django.contrib import admin

from is_kmp.models.purchase_type import PurchaseType


@admin.register(PurchaseType)
class PurchaseTypeAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
    ]

    search_fields = [
        'name',
    ]
