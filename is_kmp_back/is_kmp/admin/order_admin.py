from django.contrib import admin

from is_kmp.models.order import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
        'description',
    ]

    search_fields = [
        'id',
        'name',
        'description',
    ]
