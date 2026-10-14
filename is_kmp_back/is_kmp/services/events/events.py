from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.event import Event


def get_event_by_id_or_exception(event_id: int):
    event = get_event_by_id(event_id)
    if not event:
        raise NotFoundException(f'Не найдено мероприятие с id {event_id}')
    return event


def get_event_by_id(event_id: int):
    return Event.objects.filter(id=event_id).first()
