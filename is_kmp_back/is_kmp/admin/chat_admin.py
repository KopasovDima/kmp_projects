from django.contrib import admin

from is_kmp.models.chat import Chat


class ChatParticipantsInline(admin.TabularInline):
    model = Chat.participants.through
    verbose_name = 'Чат пользователя'
    verbose_name_plural = 'Чаты пользователей'


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    exclude = [
        'participants',
    ]
    inlines = [
        ChatParticipantsInline,
    ]
    list_display = [
        'id',
        'name',
        'is_group',
        'author_id',
        'created',
    ]

    search_fields = [
        'id',
        'name',
    ]

    list_filter = [
        'is_group',
        'author_id',
    ]
