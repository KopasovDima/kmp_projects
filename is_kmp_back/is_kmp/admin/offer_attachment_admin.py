from django.contrib import admin

from is_kmp.models.offer_attachment import OfferAttachment


@admin.register(OfferAttachment)
class OfferAttachmentAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'offer',
        'file',
        'mimetype',
        'filename',
    ]

    search_fields = [
        'id',
        'offer',
        'filename',
    ]

    list_filter = [
        'mimetype',
    ]
