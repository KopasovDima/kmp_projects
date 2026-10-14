from django.contrib import admin

from is_kmp.models.event_participant import EventParticipant


@admin.register(EventParticipant)
class EventParticipantAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'user_id',
        'company',
        'event',
        'hidden',
    ]

    search_fields = [
        'id',
        'user_id',
        'company__name',
        'event__id',
        'event__name',
    ]

    list_filter = [
        'hidden',
    ]
