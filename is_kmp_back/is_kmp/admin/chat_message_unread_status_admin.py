from django.contrib import admin

from is_kmp.models.chat_message_unread_status import ChatMessageUnreadStatus


@admin.register(ChatMessageUnreadStatus)
class ChatMessageUnreadStatusAdmin(admin.ModelAdmin):
    list_display = [
        'message',
        'user_id',
    ]

    search_fields = [
        'message',
    ]

    list_filter = [
        'user_id',
    ]
