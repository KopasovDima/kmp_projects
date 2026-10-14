from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.event_participant import EventParticipant


def get_event_participant_by_id_or_exception(event_participant_id: int):
    event_participant = get_event_participant_by_id(event_participant_id)
    if not event_participant:
        raise NotFoundException(f'Не найден участник мероприятия с id {event_participant_id}')
    return event_participant


def get_event_participant_by_id(event_participant_id: int):
    return EventParticipant.objects.filter(id=event_participant_id).first()
