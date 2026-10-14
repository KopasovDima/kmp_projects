import os
import shutil
import uuid

import magic
from django.core.files import File
from django.db.models import Count
from django.http.multipartparser import MultiPartParser
from django.views.decorators.http import require_GET, require_POST

from config.base_dir import BASE_DIR
from is_kmp.consts.roles import ROLE_ADMIN
from is_kmp.exceptions.bad_request_exception import BadRequestException
from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.offer import Offer
from is_kmp.models.offer_attachment import OfferAttachment
from is_kmp.models.offer_comment import OfferComment
from is_kmp.models.offer_comment_unread_status import OfferCommentUnreadStatus
from is_kmp.models.offer_last_read_comment import OfferLastReadComment
from is_kmp.services.offers.offers import get_offer_by_id_or_exception, add_last_read_comment
from is_kmp.utils.auth_service import get_internal_users_ids
from is_kmp.utils.decorators import require_role, require_auth, require_PUT, require_DELETE, require_PATCH
from is_kmp.utils.request_params import get_request_value_str, get_request_value_int, get_request_value_bool, \
    get_request_value_list_int
from is_kmp.utils.upload_files import save_uploaded_files_locally
from is_kmp.utils.urls import get_file_server_url
from is_kmp.utils.websocket_utils import send_event_to_socket


@require_GET
@require_auth
def get_offers(_, user_id, ___, ____):
    result = []

    for offer in Offer.objects.all().order_by('id'):
        result.append({
            'id': offer.pk,
            'name': offer.name,
            'description': offer.description,
            'offer_company': offer.offer_company,
            'comments_count': offer.comments.count() or 0,
            'unread_comments_count': (
                offer.comments
                .filter(unread_statuses__user_id=user_id)
                .count() or 0
            ),
            'attachments_count': offer.attachments.count() or 0,
        })

    return {
        'offers': result,
    }


@require_POST
@require_role(ROLE_ADMIN)
def create_offer(request, user_id, _, __):
    name = get_request_value_str(request.POST, 'name', True)
    description = get_request_value_str(request.POST, 'description', True)
    company = get_request_value_str(request.POST, 'company', True)

    offer = Offer()

    offer.name = name
    offer.description = description
    offer.offer_company = company

    offer.save()

    internal_users_ids = get_internal_users_ids()

    for internal_user_id in internal_users_ids:
        if internal_user_id == user_id:
            continue
        send_event_to_socket(f'user_{internal_user_id}', 'offers_updated')

    return {
        'created_offer': {
            'id': offer.pk,
            'name': offer.name,
            'description': offer.description,
            'offer_company': offer.offer_company,
        }
    }


@require_PUT
@require_role(ROLE_ADMIN)
def update_offer(request, user_id, _, __, offer_id: int):
    offer = get_offer_by_id_or_exception(offer_id)

    data, _ = MultiPartParser(request.META, request, request.upload_handlers).parse()

    name = get_request_value_str(data, 'name', True)
    description = get_request_value_str(data, 'description', True)
    company = get_request_value_str(data, 'company', True)

    offer.name = name
    offer.description = description
    offer.offer_company = company

    offer.save()

    internal_users_ids = get_internal_users_ids()

    for internal_user_id in internal_users_ids:
        if internal_user_id == user_id:
            continue
        send_event_to_socket(f'user_{internal_user_id}', 'offers_updated')

    return {
        'updated_offer': {
            'id': offer.pk,
            'name': offer.name,
            'description': offer.description,
            'offer_company': offer.offer_company,
        }
    }


@require_DELETE
@require_role(ROLE_ADMIN)
def delete_offer(_, user_id, __, ___, offer_id: int):
    offer = get_offer_by_id_or_exception(offer_id)

    if os.path.exists(BASE_DIR / f'media/offer_attachments/{offer_id}/'):
        shutil.rmtree(BASE_DIR / f'media/offer_attachments/{offer_id}/')

    offer.delete()

    internal_users_ids = get_internal_users_ids()

    for internal_user_id in internal_users_ids:
        if internal_user_id == user_id:
            continue
        send_event_to_socket(f'user_{internal_user_id}', 'offers_updated')

    return 'OK'


@require_POST
@require_auth
def write_comment_to_offer(request, user_id, __, ___, offer_id: int):
    comment = get_request_value_str(request.POST, 'comment')
    parent_comment_id = get_request_value_int(request.POST, 'parent_comment_id')

    if not comment and not len(request.FILES):
        raise BadRequestException('Не указан комментарий')

    offer = get_offer_by_id_or_exception(offer_id)

    parent_comment = None
    if parent_comment_id:
        parent_comment = offer.comments.filter(id=parent_comment_id).first()
        if not parent_comment:
            raise NotFoundException(f'Не найдено родительский комментарий с id {parent_comment_id}')

    offer_comment = OfferComment()

    offer_comment.offer_id = offer.pk
    offer_comment.author_id = user_id
    offer_comment.text = comment.strip()
    offer_comment.parent_comment = parent_comment
    offer_comment.save()

    internal_users_ids = get_internal_users_ids()

    OfferCommentUnreadStatus.objects.bulk_create([
        OfferCommentUnreadStatus(user_id=internal_user_id, comment=offer_comment)
        for internal_user_id in internal_users_ids if internal_user_id != user_id
    ])

    # services.chats.attach_files_to_message(chat_message, request)

    add_last_read_comment(offer_id, user_id, offer_comment)

    send_event_to_socket(
        f'offer_{offer_id}',
        'offer_comment',
        {'comment_id': offer_comment.pk}
    )
    for internal_user_id in internal_users_ids:
        send_event_to_socket(f'user_{internal_user_id}', 'offers_updated')

    return 'ОК'


@require_GET
@require_auth
def get_offer_comments(_, user_id, __, ___, offer_id: int):
    offer = get_offer_by_id_or_exception(offer_id)

    result = []

    comments = offer.comments.all().order_by('-date')

    for comment in comments:
        comment_info = {
            'id': comment.id,
            'author_id': comment.author_id,
            'date': comment.date,
            'text': comment.text,
            'parent_comment_id': comment.parent_comment_id,
        }

        if comment.author_id == user_id:
            comment_info['unread_by'] = [unread_statuses.user_id for unread_statuses in comment.unread_statuses.all()]
        else:
            comment_info['unread_by_current_user'] = comment.unread_statuses.filter(user_id=user_id).exists()

        result.append(comment_info)

    last_read_comment = OfferLastReadComment.objects.filter(offer_id=offer_id, user_id=user_id).first()

    return {
        'comments': result,
        'last_read_comment_id': last_read_comment.comment_id if last_read_comment else None,
    }


@require_PATCH
@require_auth
def read_offer_comment(request, user_id, _, __, offer_id: int, comment_id: int):
    read_all_comments_before = get_request_value_bool(request.GET, 'read_all_comments_before')

    offer = get_offer_by_id_or_exception(offer_id)

    comment = offer.comments.filter(id=comment_id).first()

    if not comment:
        raise NotFoundException(f'Комментарий с id {comment_id} не найден')

    if read_all_comments_before:
        OfferCommentUnreadStatus.objects.filter(user_id=user_id, comment__offer_id=offer_id).delete()
    else:
        if unread_status := comment.unread_statuses.filter(user_id=user_id).first():
            unread_status.delete()

    add_last_read_comment(offer_id, user_id, comment)

    send_event_to_socket(
        f'offer_{offer_id}',
        'offer_comment',
        {'comment_id': comment_id, 'user_id': user_id}
    )
    send_event_to_socket(
        f'offer_{offer_id}',
        'offer_comment',
        {'comment_id': comment_id, 'user_id': comment.author_id}
    )
    send_event_to_socket(f'user_{user_id}', 'offers_updated')
    send_event_to_socket(f'user_{comment.author_id}', 'offers_updated')

    return 'OK'


@require_GET
@require_auth
def get_unread_comments_count(request, user_id, _, __):
    offer_id = get_request_value_int(request.GET, 'offer_id')
    count_offers = get_request_value_bool(request.GET, 'count_offers')

    comments = OfferComment.objects.all()

    if offer_id:
        comments = comments.filter(offer_id=offer_id)

    comments = comments.filter(unread_statuses__user_id=user_id)

    if count_offers:
        comments = comments.values('offer_id').annotate(count=Count('offer_id', distinct=True))

    comments_count = comments.count()

    return {
        'comments_count': comments_count,
    }


@require_GET
@require_auth
def get_attachments(request, _, __, ___, offer_id: int):
    offer = get_offer_by_id_or_exception(offer_id)

    result = []

    for attachment in offer.attachments.order_by('id'):
        result.append({
            'id': attachment.id,
            'url': get_file_server_url(request, attachment.file.url),
            'mimetype': attachment.mimetype,
            'filename': attachment.filename,
        })

    return {
        'attachments': result,
    }


@require_POST
@require_role(ROLE_ADMIN)
def add_attachments(request, _, __, ___, offer_id: int):
    offer = get_offer_by_id_or_exception(offer_id)

    file_folder = BASE_DIR / f'temp_files/offer_{offer_id}_{uuid.uuid4()}/'

    try:
        uploaded_files = save_uploaded_files_locally(request, file_folder)

        magic_instance = magic.Magic(mime=True)

        if len(uploaded_files):
            for file in uploaded_files:
                attachment = OfferAttachment()

                attachment.offer = offer
                with open(file_folder / file, 'rb') as f:
                    attachment.file.save(file, File(f))

                attachment.mimetype = magic_instance.from_file(file_folder / file)
                attachment.filename = file

                attachment.save()
    finally:
        if os.path.exists(file_folder):
            shutil.rmtree(file_folder)

    return 'ОК'


@require_DELETE
@require_role(ROLE_ADMIN)
def remove_attachments(request, _, __, ___, offer_id: int):
    offer = get_offer_by_id_or_exception(offer_id)
    ids = get_request_value_list_int(request.GET, 'ids', 'Не указан список id удаляемых вложений')

    deleting_attachments = offer.attachments.filter(id__in=ids)

    if len(deleting_attachments) != len(ids):
        found_ids = {obj.id for obj in deleting_attachments}
        missing_ids = set(ids) - found_ids
        raise NotFoundException(f'Вложения с id {list(missing_ids)} не найдены')

    files = [attachment.file.path for attachment in deleting_attachments]

    deleting_attachments.delete()

    for file in files:
        if os.path.exists(file):
            os.remove(file)

    return 'ОК'
