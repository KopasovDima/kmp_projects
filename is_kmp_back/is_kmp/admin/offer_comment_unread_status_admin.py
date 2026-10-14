from django.contrib import admin

from is_kmp.models.offer_comment_unread_status import OfferCommentUnreadStatus


@admin.register(OfferCommentUnreadStatus)
class OfferCommentUnreadStatusAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'comment',
        'user_id',
    ]

    search_fields = [
        'id',
        'comment',
    ]

    list_filter = [
        'user_id',
    ]
