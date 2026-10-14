from django.db.models import Case, When, Value, IntegerField
from django.views.decorators.http import require_GET

from is_kmp.exceptions.bad_request_exception import BadRequestException
from is_kmp.exceptions.forbidden_exception import ForbiddenException
from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.company import Company
from is_kmp.models.event_participant import EventParticipant
from is_kmp.services.events.event_participant_notifications import add_default_notification, check_have_access_to_event
from is_kmp.services.events.event_participants import get_event_participant_by_id_or_exception
from is_kmp.services.events.events import get_event_by_id_or_exception
from is_kmp.utils.auth_service import get_internal_user_profiles
from is_kmp.utils.decorators import require_auth, require_DELETE, require_PATCH
from is_kmp.utils.permissions import check_admin
from is_kmp.utils.request_params import get_request_value_int, get_request_value_bool


@require_GET
@require_auth
def get_user_profiles(request, __, ___, ____):
    include_company_name = get_request_value_bool(request.GET, 'include_company_name')
    include_photo = get_request_value_bool(request.GET, 'include_photo')

    return get_internal_user_profiles(
        include_company_name=include_company_name,
        include_photo=include_photo,
    )


@require_GET
@require_auth
def get_participants(request, _, __, ___):
    event_id = get_request_value_int(request.GET, 'event_id', True)

    event = get_event_by_id_or_exception(event_id)

    response = []

    participants = event.participants.filter(hidden=False).annotate(
        priority=Case(
            When(user_id=event.author_id, then=Value(0)),
            default=Value(1),
            output_field=IntegerField(),
        )
    ).order_by('priority', 'company__name', 'user_id')

    for participant in participants:
        if participant.user_id:
            user_profile_info = get_internal_user_profiles(participant.user_id)['user_profiles']

            if user_profile_info:
                response.append({
                    'id': participant.id,
                    'user': user_profile_info[0],
                })

        elif participant.company:
            response.append({
                'id': participant.id,
                'company': {
                    'id': participant.company.id,
                    'short_name': participant.company.short_name,
                },
            })

    return {
        'participants': response,
    }


@require_PATCH
@require_auth
def add_participant(request, user_id, _, user_roles):
    event_id = get_request_value_int(request.GET, 'event_id', True)

    event = get_event_by_id_or_exception(event_id)

    if not check_admin(user_roles) and event.author_id != user_id:
        raise ForbiddenException('Нет доступа к данному мероприятию')

    user_id = get_request_value_int(request.GET, 'user_id')
    company_id = get_request_value_int(request.GET, 'company_id')

    if user_id:
        event_participant = event.participants.filter(user_id=user_id).first()

        if event_participant:
            if not event_participant.hidden:
                raise BadRequestException('Участник уже добавлен')

            event_participant.hidden = False
        else:
            user_profile_info = get_internal_user_profiles(user_id)['user_profiles']

            if not user_profile_info:
                raise NotFoundException(f'Не найден пользователь с id {user_id}')

            event_participant = EventParticipant()

            event_participant.user_id = user_id
            event_participant.event_id = event.pk

        event_participant.save()

        add_default_notification(event, event_participant)
    elif company_id:
        existing_participants = event.participants.filter(company_id=company_id).first()

        if existing_participants:
            raise BadRequestException('Участник уже добавлен')

        company = Company.objects.filter(id=company_id).first()

        if not company:
            raise NotFoundException(f'Не найдена компания с id {company_id}')

        event_participant = EventParticipant()

        event_participant.company_id = company_id
        event_participant.event_id = event.pk

        event_participant.save()
    else:
        raise BadRequestException('Нужно указать либо user_id, либо company_id')

    return 'OK'


@require_DELETE
@require_auth
def delete_participant(_, user_id, __, user_roles, participant_id: int):
    event_participant = get_event_participant_by_id_or_exception(participant_id)

    if not check_admin(user_roles) and event_participant.event.author_id != user_id:
        raise ForbiddenException('Нет доступа к данному мероприятию')

    if event_participant.user_id == event_participant.event.author_id:
        raise BadRequestException('Невозможно удалить автора мероприятия из участников')

    event = event_participant.event

    event_participant.delete()

    if event_participant.company_id:
        for hidden_participant in event.participants.filter(hidden=True):
            try:
                hidden_participant_profile_info = (
                    get_internal_user_profiles(hidden_participant.user_id)['user_profiles']
                )
                check_have_access_to_event(
                    event.id, hidden_participant.user_id, hidden_participant_profile_info[0]['company']['id']
                )
            except (Exception,) as _:
                hidden_participant.delete()

    return 'OK'
