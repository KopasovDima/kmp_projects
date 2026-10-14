from django.contrib import admin

from is_kmp.models.order_attachment import OrderAttachment


@admin.register(OrderAttachment)
class OrderAttachmentAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'order',
        'file',
        'mimetype',
        'filename',
    ]

    search_fields = [
        'id',
        'order',
        'filename',
    ]

    list_filter = [
        'mimetype',
    ]
