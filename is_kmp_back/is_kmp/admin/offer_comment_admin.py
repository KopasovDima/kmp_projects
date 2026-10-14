from django.contrib import admin

from is_kmp.models.offer_comment import OfferComment


@admin.register(OfferComment)
class OfferCommentAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'offer',
        'author_id',
        'date',
        'text',
        'parent_comment',
    ]

    search_fields = [
        'id',
        'offer',
        'text',
    ]

    list_filter = [
        'author_id',
    ]
