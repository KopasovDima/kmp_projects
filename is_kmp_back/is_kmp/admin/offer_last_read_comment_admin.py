from django.contrib import admin

from is_kmp.models.offer_last_read_comment import OfferLastReadComment


@admin.register(OfferLastReadComment)
class OfferLastReadCommentAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'offer',
        'user_id',
        'comment',
    ]

    search_fields = [
        'id',
        'offer',
        'comment',
    ]

    list_filter = [
        'user_id',
    ]
