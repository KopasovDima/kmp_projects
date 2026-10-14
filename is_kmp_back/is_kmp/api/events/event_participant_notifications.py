from django.views.decorators.http import require_GET, require_POST

from is_kmp.exceptions.bad_request_exception import BadRequestException
from is_kmp.exceptions.forbidden_exception import ForbiddenException
from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.event_notification_interval import EventNotificationInterval
from is_kmp.models.event_participant import EventParticipant
from is_kmp.models.event_participant_notification import EventParticipantNotification
from is_kmp.services.events.event_participant_notifications import check_have_access_to_event, add_notification
from is_kmp.services.events.events import get_event_by_id_or_exception
from is_kmp.utils.decorators import require_auth, require_DELETE
from is_kmp.utils.permissions import check_admin
from is_kmp.utils.request_params import get_request_value_int, get_request_value_str


@require_GET
@require_auth
def get_event_participant_notifications(request, user_id, user_company_id, user_roles):
    event_id = get_request_value_int(request.GET, 'event_id', True)

    event = get_event_by_id_or_exception(event_id)

    response = []

    participants = event.participants.filter(user_id=user_id)

    if not check_admin(user_roles):
        check_have_access_to_event(event_id, user_id, user_company_id)

    if not participants:
        event_participant = EventParticipant()

        event_participant.user_id = user_id
        event_participant.event_id = event.pk
        event_participant.hidden = True

        event_participant.save()
    else:
        notifications = participants[0].notifications.filter(interval__value__gt=0).order_by('id')

        for notification in notifications:
            response.append({
                'id': notification.id,
                'interval_name': notification.interval.name,
            })

    return {
        'notifications': response,
    }


@require_GET
@require_auth
def get_possible_notification_intervals(_, __, ___, ____):
    response = []

    for interval in EventNotificationInterval.objects.filter(value__gt=0):
        response.append({
            'interval_id': interval.id,
            'interval_name': interval.name,
        })

    return {
        'notification_intervals': response,
    }


@require_POST
@require_auth
def add_event_participant_notification(request, user_id, _, __):
    event_id = get_request_value_int(request.POST, 'event_id', True)
    notification_interval_id = get_request_value_str(request.POST, 'notification_interval_id', True)

    event = get_event_by_id_or_exception(event_id)

    notification_interval = EventNotificationInterval.objects.filter(pk=notification_interval_id).first()

    if not notification_interval:
        raise NotFoundException(f'Не найден интервал уведомления с id {notification_interval_id}')

    participant = event.participants.filter(user_id=user_id).first()

    if not participant:
        raise ForbiddenException('Данный пользователь не является участником мероприятия')

    add_notification(event, participant, notification_interval)

    return 'OK'


@require_DELETE
@require_auth
def delete_event_participant_notification(_, user_id, __, ___, event_participant_notification_id: int):
    event_participant_notification = (
        EventParticipantNotification.objects
        .filter(id=event_participant_notification_id)
        .first()
    )

    if not event_participant_notification:
        raise NotFoundException(
            f'Не найдено уведомление участника мероприятия с id {event_participant_notification_id}'
        )

    if event_participant_notification.event_participant.user_id != user_id:
        raise ForbiddenException(
            f'Нет доступа к уведомлению участника мероприятия с id {event_participant_notification_id}'
        )

    event_participant_notification.delete()

    return 'OK'


@require_POST
@require_auth
def notify_all_participants_now(request, user_id, __, user_roles):
    event_id = get_request_value_int(request.POST, 'event_id', True)

    event = get_event_by_id_or_exception(event_id)

    if not check_admin(user_roles) and event.author_id != user_id:
        raise ForbiddenException('Мгновенные уведомления может отправить только админ или автор мероприятия')

    for participant in event.participants.filter(user_id__isnull=False):
        if participant.hidden:
            if not participant.notifications.count():
                continue
        notification_interval = EventNotificationInterval.objects.filter(value=0).first()
        if not notification_interval:
            raise BadRequestException('Не удалось отправить мгновенное уведомление')
        add_notification(event, participant, notification_interval)

    return 'OK'
