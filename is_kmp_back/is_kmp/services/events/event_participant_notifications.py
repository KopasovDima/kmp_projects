from datetime import timedelta

from django.db.models import Q
from django.utils import timezone

from is_kmp.exceptions.bad_request_exception import BadRequestException
from is_kmp.exceptions.forbidden_exception import ForbiddenException
from is_kmp.models.company import Company
from is_kmp.models.event import Event
from is_kmp.models.event_notification_interval import EventNotificationInterval
from is_kmp.models.event_participant import EventParticipant
from is_kmp.models.event_participant_notification import EventParticipantNotification


def check_have_access_to_event(event_id: int, user_id: int, user_company_id: int | None = None):
    if user_company_id:
        company_qs = Company.objects.filter(
            Q(id=user_company_id) |
            Q(parent_id=user_company_id) |
            Q(parent__parent_id=user_company_id) |
            Q(parent__parent__parent_id=user_company_id) |
            Q(parent__parent__parent__parent_id=user_company_id)
        ).distinct()
    else:
        company_qs = []

    events = (
        Event.objects
        .filter(id=event_id)
        .filter(
            Q(author_id=user_id) |
            (Q(participants__user_id__contains=user_id) & Q(participants__hidden=False)) |
            Q(participants__company__in=company_qs)
        )
    )

    if not events:
        raise ForbiddenException(f'Не доступа к мероприятию с id {event_id}')


def add_default_notification(event: Event, event_participant: EventParticipant):
    for default_interval in EventNotificationInterval.objects.filter(is_default=True):
        add_notification(event, event_participant, default_interval)


def add_notification(
        event: Event, event_participant: EventParticipant, notification_interval: EventNotificationInterval,
):
    if notification_interval.value != 0:
        existing_notification_for_interval = EventParticipantNotification.objects.filter(
            event_participant=event_participant,
            interval=notification_interval,
        ).first()

        if existing_notification_for_interval:
            raise BadRequestException('Уведомление с таким интервалом уже добавлено')

    event_participant_notification = EventParticipantNotification()

    event_participant_notification.event_participant = event_participant

    event_participant_notification.interval = notification_interval

    if notification_interval.value == 0:
        event_participant_notification.date = timezone.now()
    else:
        event_participant_notification.date = event.start_date - timedelta(
            milliseconds=notification_interval.value * notification_interval.value_type
        )

        if event_participant_notification.date < timezone.now():
            event_participant_notification.completed = True

    event_participant_notification.save()
