from django.db.models import Max, Count, Case, When, Value, IntegerField, DateTimeField, F
from django.db.models.functions import Coalesce
from django.http.multipartparser import MultiPartParser
from django.views.decorators.http import require_GET, require_POST

from config.logger import log_error
from is_kmp.exceptions.bad_request_exception import BadRequestException
from is_kmp.exceptions.forbidden_exception import ForbiddenException
from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.chat import Chat
from is_kmp.models.chat_last_read_message import ChatLastReadMessage
from is_kmp.models.chat_message import ChatMessage
from is_kmp.models.chat_message_unread_status import ChatMessageUnreadStatus
from is_kmp.services.chats.chats import (
    get_or_create_chat_participant_by_user_id, get_contact_user_info, get_chat_by_id_or_exception,
    add_last_read_message, create_chat_message, attach_files_to_message,
)
from is_kmp.utils.decorators import (
    require_auth, require_PUT, require_PATCH, require_DELETE, check_remote_ip_allowed,
)
from is_kmp.utils.request_params import get_request_value_str, get_request_value_int, get_request_value_list_int, \
    get_request_value_bool
from is_kmp.utils.urls import get_file_server_url
from is_kmp.utils.websocket_utils import send_event_to_socket


@require_GET
@require_auth
def get_chats(request, user_id, _, __):
    search_name = get_request_value_str(request.GET, 'search_name')

    chats = (
        Chat.objects
        .filter(participants__user_id=user_id)
        .annotate(
            message_max_date=Coalesce(
                Max('messages__date'),
                F('created'),
                output_field=DateTimeField(),
            ))
        .order_by('-message_max_date', '-created')
    )

    result = []

    for chat in chats:
        chat_name = chat.name
        chat_photo = None
        if not chat.is_group:
            contact_user = chat.participants.exclude(user_id=user_id).first()

            if not contact_user:
                log_error(f'Не найден второй участник чата с ID {chat.id}')
                continue

            contact_user_id = contact_user.user_id

            contact_user_info = get_contact_user_info(contact_user_id, False, True)

            if not contact_user_info:
                continue

            chat_name = f'{contact_user_info.get("first_name")} {contact_user_info.get("last_name")}'
            chat_photo = contact_user_info.get('photo')

        if search_name and search_name.strip() and search_name.lower().strip() not in chat_name.lower():
            continue

        last_message = chat.messages.filter(date=chat.message_max_date).first()

        last_message_content = None

        if last_message:
            if last_message.text:
                last_message_content = last_message.text[:150]
            elif last_message_files_count := last_message.attachments.count():
                last_message_content = f'Прикреплено файлов: {last_message_files_count}'

        result.append({
            'id': chat.id,
            'is_group': chat.is_group,
            'last_message_date': chat.message_max_date,
            'last_message': last_message_content,
            'chat_name': chat_name,
            'chat_photo': chat_photo,
            'unread_count': (
                chat.messages
                .filter(unread_statuses__user_id=user_id)
                .count()
            ),
            'author_id': chat.author_id,
        })

    return {
        'chats': result,
    }


@require_POST
@require_auth
def create_group_chat(request, user_id, __, ___):
    chat_name = get_request_value_str(request.POST, 'chat_name', True)

    chat = Chat()

    chat.is_group = True
    chat.name = chat_name
    chat.author_id = user_id

    chat.save()

    chat_participant = get_or_create_chat_participant_by_user_id(user_id)
    chat.participants.add(chat_participant)

    send_event_to_socket(f'user_{user_id}', 'chat_update')

    return {
        'chat_info': {
            'id': chat.pk,
            'is_group': chat.is_group,
            'chat_name': chat_name,
        }
    }


@require_GET
@require_auth
def get_group_chat_participants(_, user_id, __, ___, chat_id: int):
    chat = get_chat_by_id_or_exception(chat_id)

    current_user_participant = chat.participants.filter(user_id=user_id)

    if not current_user_participant:
        raise ForbiddenException('Нет доступа к чату')

    if not chat.is_group:
        raise BadRequestException('Чат не является групповым')

    result = []

    participants = (
        chat.participants
        .annotate(
            role_order=Case(
                When(user_id=chat.author_id, then=Value(0)),
                default=Value(100),
                output_field=IntegerField(),
            )
        )
        .order_by('role_order')
    )

    for participant in participants:
        participant_user_info = get_contact_user_info(participant.user_id, True, True)

        if not participant_user_info:
            continue

        if participant.user_id == chat.author_id:
            participant_user_info['role'] = 'Автор'

        result.append(participant_user_info)

    return {
        'chat_participants': result,
    }


@require_PUT
@require_auth
def update_group_chat(request, user_id, _, __, chat_id: int):
    data, _ = MultiPartParser(request.META, request, request.upload_handlers).parse()
    chat_name = get_request_value_str(data, 'chat_name', True)

    chat = get_chat_by_id_or_exception(chat_id)

    if not chat.is_group:
        raise BadRequestException('Чат не является групповым')

    if user_id != chat.author_id:
        raise ForbiddenException('Только автор чата может редактировать чат')

    chat.name = chat_name

    chat.save()

    for participant in chat.participants.all():
        send_event_to_socket(f'user_{participant.user_id}', 'chat_update')

    return {
        'chat_info': {
            'id': chat.pk,
            'is_group': chat.is_group,
            'chat_name': chat_name,
        }
    }


@require_PATCH
@require_auth
def add_participants_to_group_chat(request, user_id, _, __, chat_id: int):
    data, _ = MultiPartParser(request.META, request, request.upload_handlers).parse()
    contact_user_ids = get_request_value_list_int(data, 'contact_user_ids', True)

    chat = get_chat_by_id_or_exception(chat_id)

    if not chat.is_group:
        raise BadRequestException('Чат не является групповым')

    if user_id != chat.author_id:
        raise ForbiddenException('Только автор чата может добавлять новых участников')

    new_participants = []
    for contact_user_id in contact_user_ids:
        existing_user_participant = chat.participants.filter(user_id=contact_user_id)

        if existing_user_participant:
            raise BadRequestException(f'Пользователь с id {contact_user_id} уже является участником чата')

        if not get_contact_user_info(contact_user_id):
            raise NotFoundException(f'Не найден пользователь с id {contact_user_id}')

        new_participants.append(get_or_create_chat_participant_by_user_id(contact_user_id))

    chat.participants.add(*new_participants)

    for contact_user_id in contact_user_ids:
        send_event_to_socket(f'user_{contact_user_id}', 'chat_update')

    return 'ОК'


@require_DELETE
@require_auth
def remove_participant_from_group_chat(_, user_id, __, ___, chat_id: int, removing_user_id: int):
    chat = get_chat_by_id_or_exception(chat_id)

    if not chat.is_group:
        raise BadRequestException('Чат не является групповым')

    if user_id != chat.author_id:
        raise ForbiddenException('Только автор чата может удалять участников')

    if removing_user_id == chat.author_id:
        raise BadRequestException('Невозможно удалить автора чата')

    existing_user_participant = chat.participants.filter(user_id=removing_user_id)

    if not existing_user_participant:
        raise BadRequestException(f'Пользователь с id {removing_user_id} не является участником чата')

    chat.participants.remove(existing_user_participant.first())

    send_event_to_socket(f'user_{removing_user_id}', 'chat_update')
    send_event_to_socket(f'chat_{chat_id}', 'force_disconnect', {'user_id': removing_user_id})

    return 'ОК'


@require_DELETE
@require_auth
def delete_group_chat(_, user_id, __, ___, chat_id: int):
    chat = get_chat_by_id_or_exception(chat_id)

    if not chat.is_group:
        raise BadRequestException('Чат не является групповым')

    if user_id != chat.author_id:
        raise ForbiddenException('Только автор чата может удалить чат')

    chat_participant_user_ids = [participant.user_id for participant in chat.participants.all()]

    chat.delete()

    for user_id in chat_participant_user_ids:
        send_event_to_socket(f'user_{user_id}', 'chat_update')
        send_event_to_socket(f'chat_{chat_id}', 'force_disconnect', {'user_id': user_id})

    return 'ОК'


@require_POST
@require_auth
def create_personal_chat(request, user_id, __, ___):
    contact_user_id = get_request_value_int(request.POST, 'contact_user_id', True)
    first_message = get_request_value_str(request.POST, 'first_message')

    if user_id == contact_user_id:
        raise BadRequestException('Невозможно создать персональный чат самим с собой')

    existing_chat = (
        Chat.objects
        .filter(is_group=False)
        .filter(participants__user_id=user_id)
        .filter(participants__user_id=contact_user_id)
    )

    if existing_chat:
        raise BadRequestException(f'Чат с пользователем {contact_user_id} уже создан')

    contact_user_info = get_contact_user_info(contact_user_id, False, True)
    if not contact_user_info:
        raise NotFoundException(f'Не найден пользователь с id {contact_user_id}')

    chat_name = f'{contact_user_info.get("first_name")} {contact_user_info.get("last_name")}'
    chat_photo = contact_user_info.get('photo')

    chat = Chat()
    chat.is_group = False
    chat.save()

    chat_participant = get_or_create_chat_participant_by_user_id(user_id)
    contacting_chat_participant = get_or_create_chat_participant_by_user_id(contact_user_id)

    chat.participants.add(chat_participant, contacting_chat_participant)

    if first_message or len(request.FILES):
        chat_message = create_chat_message(chat, user_id, first_message or '')
        attach_files_to_message(chat_message, request)

    send_event_to_socket(f'user_{user_id}', 'chat_update')
    send_event_to_socket(f'user_{contact_user_id}', 'chat_update')

    return {
        'chat_info': {
            'id': chat.pk,
            'is_group': chat.is_group,
            'chat_name': chat_name,
            'chat_photo': chat_photo,
        }
    }


@require_POST
@require_auth
def write_message_to_chat(request, user_id, __, ___, chat_id: int):
    message = get_request_value_str(request.POST, 'message')
    parent_message_id = get_request_value_int(request.POST, 'parent_message_id')

    if not message and not len(request.FILES):
        raise BadRequestException('Не указано сообщение')

    chat = get_chat_by_id_or_exception(chat_id)

    current_user_participant = chat.participants.filter(user_id=user_id)

    if not current_user_participant:
        raise ForbiddenException('Пользователь не является участником чата')

    parent_message = None
    if parent_message_id:
        parent_message = chat.messages.filter(id=parent_message_id).first()
        if not parent_message:
            raise NotFoundException(f'Не найдено родительское сообщение с id {parent_message_id}')

    chat_message = create_chat_message(chat, user_id, message or '', parent_message)
    attach_files_to_message(chat_message, request)

    add_last_read_message(chat_id, user_id, chat_message)

    send_event_to_socket(
        f'chat_{chat_id}',
        'chat_message',
        {'message_id': chat_message.pk}
    )
    for participant in chat.participants.all():
        send_event_to_socket(f'user_{participant.user_id}', 'chat_update')

    return 'ОК'


@require_GET
@require_auth
def get_chat_messages(request, user_id, _, __, chat_id: int):
    chat = get_chat_by_id_or_exception(chat_id)

    current_user_participant = chat.participants.filter(user_id=user_id).first()

    if not current_user_participant:
        raise ForbiddenException('Пользователь не является участником чата')

    result = []

    messages = chat.messages.all().order_by('-date')

    for message in messages:
        m = {
            'id': message.id,
            'author_id': message.author_id,
            'date': message.date,
            'text': message.text,
            'attachments': [
                {
                    'id': attachment.id,
                    'url': get_file_server_url(request, attachment.file.url),
                    'mimetype': attachment.mimetype,
                    'filename': attachment.filename,
                } for attachment in message.attachments.all()
            ],
            'parent_message_id': message.parent_message_id,
        }

        if message.author_id == user_id:
            m['unread_by'] = [unread_statuses.user_id for unread_statuses in message.unread_statuses.all()]
        else:
            m['unread_by_current_user'] = message.unread_statuses.filter(user_id=user_id).exists()

        result.append(m)

    last_read_message = ChatLastReadMessage.objects.filter(chat_id=chat_id, user_id=user_id).first()

    return {
        'messages': result,
        'last_read_message_id': last_read_message.message_id if last_read_message else None,
    }


@require_PATCH
@require_auth
def read_chat_message(request, user_id, __, ___, chat_id: int, message_id: int):
    read_all_messages_before = get_request_value_bool(request.GET, 'read_all_messages_before')
    chat = get_chat_by_id_or_exception(chat_id)

    current_user_participant = chat.participants.filter(user_id=user_id).first()

    if not current_user_participant:
        raise ForbiddenException('Пользователь не является участником чата')

    message = chat.messages.filter(id=message_id).first()

    if not message:
        raise NotFoundException(f'Сообщение с id {message_id} не найдено')

    if read_all_messages_before:
        ChatMessageUnreadStatus.objects.filter(user_id=user_id, message__chat_id=chat_id).delete()
    else:
        if unread_status := message.unread_statuses.filter(user_id=user_id).first():
            unread_status.delete()

    add_last_read_message(chat_id, user_id, message)

    send_event_to_socket(f'user_{user_id}', 'chat_update')
    send_event_to_socket(f'user_{message.author_id}', 'chat_update')
    send_event_to_socket(
        f'chat_{chat_id}',
        'chat_message',
        {'message_id': message_id, 'user_id': user_id}
    )
    send_event_to_socket(
        f'chat_{chat_id}',
        'chat_message',
        {'message_id': message_id, 'user_id': message.author_id}
    )

    return 'OK'


@require_GET
@require_auth
def get_unread_messages_count(request, user_id, _, __):
    chat_id = get_request_value_int(request.GET, 'chat_id')
    count_chats = (get_request_value_str(request.GET, 'count_chats') or 'true') == 'true'

    messages = ChatMessage.objects.all()

    if chat_id:
        messages = messages.filter(chat_id=chat_id)

    messages = messages.filter(unread_statuses__user_id=user_id)

    if count_chats:
        messages = messages.values('chat_id').annotate(count=Count('chat_id', distinct=True))

    messages_count = messages.count()

    return {
        'messages_count': messages_count,
    }


@require_GET
@require_auth
def find_personal_chat_with_user(_, user_id, __, ___, contact_user_id: int):
    if user_id == contact_user_id:
        raise BadRequestException('Id искомого пользователя не должен совпадать с id текущего пользователя')

    existing_chat = (
        Chat.objects
        .filter(is_group=False)
        .filter(participants__user_id=user_id)
        .filter(participants__user_id=contact_user_id)
    ).first()

    if existing_chat:
        return {
            'chat_id': existing_chat.id,
        }

    return {
        'chat_id': None,
    }


@require_GET
@check_remote_ip_allowed
def get_user_unread_chats(request):
    user_id = get_request_value_int(request.GET, 'user_id', True)

    unread_chats = (
        ChatMessageUnreadStatus.objects.filter(user_id=user_id)
        .values('message__chat_id')
        .annotate(count=Count('message__chat_id'))
    )

    unread_count = {}

    for unread_chat in unread_chats:
        unread_count[unread_chat.get('message__chat_id') or 0] = unread_chat.get('count')

    chats = (
        Chat.objects
        .filter(id__in=unread_count.keys())
        .annotate(message_max_date=Max('messages__date'))
        .order_by('-message_max_date')
    )

    result = []

    for chat in chats:
        chat_name = chat.name
        if not chat.is_group:
            contact_user = chat.participants.exclude(user_id=user_id).first()

            if not contact_user:
                log_error(f'Не найден второй участник чата с ID {chat.id}')
                continue

            contact_user_id = contact_user.user_id

            contact_user_info = get_contact_user_info(contact_user_id)

            if not contact_user_info:
                continue

            chat_name = f'{contact_user_info.get("first_name")} {contact_user_info.get("last_name")}'

        result.append({
            'chat_name': chat_name,
            'is_group': chat.is_group,
            'unread_messages': unread_count[chat.id],
        })

    return {
        'unread_chats': result,
    }
