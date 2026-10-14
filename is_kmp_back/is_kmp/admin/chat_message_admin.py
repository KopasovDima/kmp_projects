from django.contrib import admin

from is_kmp.models.chat_message import ChatMessage


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'chat',
        'author_id',
        'date',
        'text',
    ]

    search_fields = [
        'id',
        'chat',
        'author_id',
        'text',
    ]

    list_filter = [
        'author_id',
    ]
