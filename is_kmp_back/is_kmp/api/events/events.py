from datetime import datetime, timedelta

from django.db.models import Count, Q
from django.db.models.functions import TruncDay
from django.http.multipartparser import MultiPartParser
from django.utils import timezone
from django.views.decorators.http import require_GET, require_POST

from is_kmp.exceptions.forbidden_exception import ForbiddenException
from is_kmp.models.company import Company
from is_kmp.models.event import Event
from is_kmp.models.event_participant import EventParticipant
from is_kmp.services.events.event_participant_notifications import add_default_notification
from is_kmp.services.events.events import get_event_by_id_or_exception
from is_kmp.utils.date_utils import get_date_with_start_daytime, get_date_with_end_daytime
from is_kmp.utils.decorators import require_auth, require_PUT, require_DELETE
from is_kmp.utils.permissions import check_admin
from is_kmp.utils.request_params import get_request_value_str


@require_GET
@require_auth
def get_events_on_date(request, user_id, user_company_id, user_roles):
    date = get_request_value_str(request.GET, 'date') or datetime.now()

    start_date = get_date_with_start_daytime(date)
    end_date = get_date_with_end_daytime(date)

    if check_admin(user_roles):
        events = Event.objects.all()
    else:
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

        events = Event.objects.filter(
            Q(author_id=user_id) |
            (Q(participants__user_id__contains=user_id) & Q(participants__hidden=False)) |
            Q(participants__company__in=company_qs)
        )

    events = events.filter(
        start_date__gte=start_date,
        start_date__lte=end_date,
    ).order_by('start_date', 'id').distinct()

    result = []

    for event in events:
        result.append({
            'id': event.pk,
            'name': event.name,
            'description': event.description,
            'start_date': event.start_date,
            'end_date': event.end_date,
            'link': event.link,
            'color': event.color,
            'author_id': event.author_id,
        })

    return {
        'events': result,
    }


@require_GET
@require_auth
def get_events_count(request, user_id, user_company_id, user_roles):
    start_date = get_request_value_str(request.GET, 'start_date', True)
    end_date = get_request_value_str(request.GET, 'end_date', True)

    start_date = get_date_with_start_daytime(start_date)
    end_date = get_date_with_end_daytime(end_date)

    if check_admin(user_roles):
        events = Event.objects.all()
    else:
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

        events = Event.objects.filter(
            Q(author_id=user_id) |
            (Q(participants__user_id__contains=user_id) & Q(participants__hidden=False)) |
            Q(participants__company__in=company_qs)
        )

    events_count = (
        events.filter(
            start_date__gte=start_date,
            start_date__lte=end_date,
        )
        .annotate(day=TruncDay('start_date'))
        .values('day')
        .annotate(count=Count('id', distinct=True))
    )

    result = []

    for ec in events_count:
        result.append({
            'day': ec.get('day').day,
            'count': ec.get('count'),
        })

    return {
        'events_count': result,
    }


@require_POST
@require_auth
def create_event(request, user_id, _, __):
    name = get_request_value_str(request.POST, 'name', True)
    description = get_request_value_str(request.POST, 'description')
    start_date = get_request_value_str(request.POST, 'start_date', True)
    end_date = get_request_value_str(request.POST, 'end_date')
    link = get_request_value_str(request.POST, 'link')
    color = get_request_value_str(request.POST, 'color', True)

    event = Event()

    event.name = name
    event.description = description
    event.start_date = datetime.fromisoformat(start_date)
    event.end_date = end_date
    event.link = link
    event.color = color
    event.author_id = user_id

    event.save()

    event_participant = EventParticipant()

    event_participant.user_id = user_id
    event_participant.event_id = event.pk

    event_participant.save()

    add_default_notification(event, event_participant)

    return {
        'created_event': {
            'id': event.pk,
            'name': event.name,
            'description': event.description,
            'start_date': event.start_date,
            'end_date': event.end_date,
            'link': event.link,
            'color': event.color,
            'author_id': event.author_id,
        },
    }


@require_PUT
@require_auth
def update_event(request, user_id, _, user_roles, event_id: int):
    event = get_event_by_id_or_exception(event_id)

    if not check_admin(user_roles) and event.author_id != user_id:
        raise ForbiddenException('Нет прав для обновления мероприятия')

    data, _ = MultiPartParser(request.META, request, request.upload_handlers).parse()

    name = get_request_value_str(data, 'name', True)
    description = get_request_value_str(data, 'description')
    start_date = get_request_value_str(data, 'start_date', True)
    start_date = datetime.fromisoformat(start_date)
    end_date = get_request_value_str(data, 'end_date')
    link = get_request_value_str(data, 'link')
    color = get_request_value_str(data, 'color', True)

    start_date_updated = event.start_date != start_date

    event.name = name
    event.description = description
    event.start_date = start_date
    event.end_date = end_date
    event.link = link
    event.color = color

    event.save()

    if start_date_updated:
        for participant in event.participants.filter(user_id__isnull=False):
            for notification in participant.notifications.all():
                notification.date = event.start_date - timedelta(
                    milliseconds=notification.interval.value * notification.interval.value_type
                )

                notification.completed = notification.date < timezone.now()

                notification.save()

    return {
        'updated_event': {
            'id': event.pk,
            'name': event.name,
            'description': event.description,
            'start_date': event.start_date,
            'end_date': event.end_date,
            'link': event.link,
            'color': event.color,
            'author_id': event.author_id,
        },
    }


@require_DELETE
@require_auth
def delete_event(_, user_id, __, user_roles, event_id: int):
    event = get_event_by_id_or_exception(event_id)

    if not check_admin(user_roles) and event.author_id != user_id:
        raise ForbiddenException('Нет прав для удаления мероприятия')

    event.delete()

    return 'OK'
