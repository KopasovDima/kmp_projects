from django.contrib import admin

from is_kmp.models.chat_last_read_message import ChatLastReadMessage


@admin.register(ChatLastReadMessage)
class ChatLastReadMessageAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'chat',
        'user_id',
        'message',
    ]

    list_filter = [
        'chat',
        'user_id',
    ]

    search_fields = [
        'message',
    ]
