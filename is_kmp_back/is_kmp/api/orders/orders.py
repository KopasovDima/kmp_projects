import os
import shutil
import uuid

import magic
from django.core.files import File
from django.http.multipartparser import MultiPartParser
from django.views.decorators.http import require_GET, require_POST

from config.base_dir import BASE_DIR
from is_kmp.consts.roles import ROLE_ADMIN
from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.order import Order
from is_kmp.models.order_attachment import OrderAttachment
from is_kmp.services.orders.orders import get_order_by_id_or_exception
from is_kmp.utils.decorators import require_role, require_auth, require_PUT, require_DELETE
from is_kmp.utils.request_params import get_request_value_str, get_request_value_list_int
from is_kmp.utils.upload_files import save_uploaded_files_locally
from is_kmp.utils.urls import get_file_server_url


@require_GET
@require_auth
def get_orders(_, __, ___, ____):
    result = []

    for order in Order.objects.all().order_by('id'):
        result.append({
            'id': order.pk,
            'name': order.name,
            'description': order.description,
            'attachments_count': order.attachments.count() or 0,
        })

    return {
        'orders': result,
    }


@require_POST
@require_role(ROLE_ADMIN)
def create_order(request, _, __, ___):
    name = get_request_value_str(request.POST, 'name', True)
    description = get_request_value_str(request.POST, 'description', True)

    order = Order()

    order.name = name
    order.description = description

    order.save()

    return {
        'created_order': {
            'id': order.pk,
            'name': order.name,
            'description': order.description,
        }
    }


@require_PUT
@require_role(ROLE_ADMIN)
def update_order(request, _, __, ___, order_id: int):
    order = get_order_by_id_or_exception(order_id)

    data, _ = MultiPartParser(request.META, request, request.upload_handlers).parse()

    name = get_request_value_str(data, 'name', True)
    description = get_request_value_str(data, 'description', True)

    order.name = name
    order.description = description

    order.save()

    return {
        'updated_order': {
            'id': order.pk,
            'name': order.name,
            'description': order.description,
        }
    }


@require_DELETE
@require_role(ROLE_ADMIN)
def delete_order(_, __, ___, ____, order_id: int):
    order = get_order_by_id_or_exception(order_id)

    if os.path.exists(BASE_DIR / f'media/order_attachments/{order_id}/'):
        shutil.rmtree(BASE_DIR / f'media/order_attachments/{order_id}/')

    order.delete()

    return 'OK'


@require_GET
@require_auth
def get_attachments(request, _, __, ___, order_id: int):
    order = get_order_by_id_or_exception(order_id)

    result = []

    for attachment in order.attachments.order_by('id'):
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
def add_attachments(request, _, __, ___, order_id: int):
    order = get_order_by_id_or_exception(order_id)

    file_folder = BASE_DIR / f'temp_files/order_{order_id}_{uuid.uuid4()}/'

    try:
        uploaded_files = save_uploaded_files_locally(request, file_folder)

        magic_instance = magic.Magic(mime=True)

        if len(uploaded_files):
            for file in uploaded_files:
                attachment = OrderAttachment()

                attachment.order = order
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
def remove_attachments(request, _, __, ___, order_id: int):
    order = get_order_by_id_or_exception(order_id)
    ids = get_request_value_list_int(request.GET, 'ids', 'Не указан список id удаляемых вложений')

    deleting_attachments = order.attachments.filter(id__in=ids)

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
