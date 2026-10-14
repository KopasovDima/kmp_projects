from django.contrib import admin

from is_kmp.models.chat_participant import ChatParticipant


@admin.register(ChatParticipant)
class ChatParticipantAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'user_id',
    ]

    search_fields = [
        'id',
        'user_id',
    ]
