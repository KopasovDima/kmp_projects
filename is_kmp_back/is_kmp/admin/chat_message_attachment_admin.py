from django.contrib import admin

from is_kmp.models.chat_message_attachment import ChatMessageAttachment


@admin.register(ChatMessageAttachment)
class ChatMessageAttachmentAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'message',
        'file',
        'mimetype',
        'filename',
    ]

    search_fields = [
        'id',
        'message',
        'filename',
    ]

    list_filter = [
        'mimetype',
    ]
