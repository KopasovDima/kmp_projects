from django.contrib import admin

from is_kmp.models.offer import Offer


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
        'description',
        'offer_company',
    ]

    search_fields = [
        'id',
        'name',
        'description',
    ]

    list_filter = [
        'offer_company',
    ]
