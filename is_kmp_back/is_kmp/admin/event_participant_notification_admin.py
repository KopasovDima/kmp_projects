from django.contrib import admin

from is_kmp.models.event_participant_notification import EventParticipantNotification


@admin.register(EventParticipantNotification)
class EventParticipantNotificationAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'event_participant',
        'interval',
        'date',
        'completed',
    ]

    search_fields = [
        'id',
        'event_participant',
        'date',
    ]

    list_filter = [
        'interval',
        'completed',
    ]
