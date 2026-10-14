import os
import shutil

import magic
from django.core.files import File

from config.base_dir import BASE_DIR
from config.logger import log_error
from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.chat import Chat
from is_kmp.models.chat_last_read_message import ChatLastReadMessage
from is_kmp.models.chat_message import ChatMessage
from is_kmp.models.chat_message_attachment import ChatMessageAttachment
from is_kmp.models.chat_message_unread_status import ChatMessageUnreadStatus
from is_kmp.models.chat_participant import ChatParticipant
from is_kmp.utils.auth_service import get_internal_user_profiles
from is_kmp.utils.upload_files import save_uploaded_files_locally


def get_chat_by_id_or_exception(chat_id: int):
    chat = get_chat_by_id(chat_id)
    if not chat:
        raise NotFoundException(f'Не найден чат с id {chat_id}')
    return chat


def get_chat_by_id(chat_id: int):
    return Chat.objects.filter(id=chat_id).first()


def get_chat_message_by_id_or_exception(chat_message_id: int):
    chat_message = get_chat_message_by_id(chat_message_id)
    if not chat_message:
        raise NotFoundException(f'Не найдено сообщение с id {chat_message_id}')
    return chat_message


def get_chat_message_by_id(chat_message_id: int):
    return ChatMessage.objects.filter(id=chat_message_id).first()


def get_chat_participant_by_user_id_or_exception(user_id: int):
    chat_participant = get_chat_participant_by_user_id(user_id)
    if not chat_participant:
        raise NotFoundException(f'Не найден участник чата с id пользователя {user_id}')
    return chat_participant


def get_chat_participant_by_user_id(user_id: int):
    return ChatParticipant.objects.filter(user_id=user_id).first()


def get_or_create_chat_participant_by_user_id(user_id: int):
    chat_participant = get_chat_participant_by_user_id(user_id)
    if not chat_participant:
        chat_participant = ChatParticipant(user_id=user_id)
        chat_participant.save()
    return chat_participant


def get_contact_user_info(contact_user_id: int, include_company_info: bool = False, include_photo: bool = False):
    contact_user_profile = get_internal_user_profiles(
        contact_user_id, include_company_info, include_photo
    ).get('user_profiles')
    contact_user_info = contact_user_profile[0].get('user', {}) if contact_user_profile else None

    if not contact_user_info:
        log_error(f'Не найдена информация пользователя с ID {contact_user_id}')

    if include_company_info:
        contact_user_info['post'] = contact_user_profile[0].get('post', '-')
        contact_user_info['company'] = contact_user_profile[0].get('company', {}).get('short_name', '-')

    return contact_user_info


def create_chat_message(chat: Chat, author_id: int, message_text: str, parent_message: ChatMessage | None = None):
    chat_message = ChatMessage()

    chat_message.chat_id = chat.pk
    chat_message.author_id = author_id
    chat_message.text = message_text.strip()
    chat_message.parent_message = parent_message
    chat_message.save()

    ChatMessageUnreadStatus.objects.bulk_create([
        ChatMessageUnreadStatus(user_id=participant.user_id, message=chat_message)
        for participant in chat.participants.exclude(user_id=author_id)
    ])

    return chat_message


def attach_files_to_message(chat_message: ChatMessage, request):
    file_folder = BASE_DIR / f'temp_files/{chat_message.pk}/'

    try:
        uploaded_files = save_uploaded_files_locally(request, file_folder)

        magic_instance = magic.Magic(mime=True)

        if len(uploaded_files):
            for file in uploaded_files:
                attachment = ChatMessageAttachment()

                attachment.message = chat_message
                with open(file_folder / file, 'rb') as f:
                    attachment.file.save(file, File(f))

                attachment.mimetype = magic_instance.from_file(file_folder / file)
                attachment.filename = file

                attachment.save()
    finally:
        if os.path.exists(file_folder):
            shutil.rmtree(file_folder)

def add_last_read_message(chat_id: int, user_id: int, message: ChatMessage):
    last_read_message = (
        ChatLastReadMessage.objects.filter(chat_id=chat_id, user_id=user_id).order_by('-message__date').first()
    )
    last_read_message_date = last_read_message.message.date if last_read_message else None
    if (last_read_message_date and last_read_message_date < message.date) or not last_read_message:
        ChatLastReadMessage.objects.filter(chat_id=chat_id, user_id=user_id).delete()
        ChatLastReadMessage(chat_id=chat_id, user_id=user_id, message_id=message.pk).save()
