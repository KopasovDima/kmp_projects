from django.contrib import admin

from is_kmp.models.purchase import Purchase


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'year',
        'company',
        'name',
        'volume',
        'cost',
        'start_date',
        'end_date',
        'initiator',
        'initiator_department',
        'purchase_number',
        'protocol_date',
        'protocol_number',
        'protocol_date_final',
        'protocol_number_final',
        'purchase_method',
        'volume_unit',
        'requests_number',
        'confirmed_requests_number',
        'supplier_name',
        'supplier_inn',
        'supplier_cost',
        'product_type',
        'supplier_type',
        'agreement_number',
        'agreement_date',
        'register_month',
        'register_number',
        'comment',
    ]

    search_fields = [
        'name',
        'purchase_number',
        'protocol_date',
        'protocol_number',
        'protocol_date_final',
        'protocol_number_final',
        'requests_number',
        'confirmed_requests_number',
        'supplier_name',
        'supplier_inn',
        'supplier_cost',
        'supplier_type',
        'agreement_number',
        'agreement_date',
        'register_month',
        'register_number',
        'comment',
    ]

    list_filter = [
        'year',
        'company',
        'initiator',
        'initiator_department',
        'product_type',
        'volume_unit',
        'purchase_method',
    ]
