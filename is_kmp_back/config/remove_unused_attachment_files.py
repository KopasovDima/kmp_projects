import os
import shutil

from config.base_dir import BASE_DIR
from is_kmp.models.chat_message_attachment import ChatMessageAttachment
from is_kmp.models.offer_attachment import OfferAttachment
from is_kmp.models.order_attachment import OrderAttachment
from is_kmp.utils.decorators import require_PATCH, check_remote_ip_allowed


def remove_attachment_files(model, folder: str, condition_id: str):
    try:
        for attachment_id in os.listdir(BASE_DIR / 'media' / folder):

            attachment = model.objects.filter(**{condition_id: int(attachment_id)}).first()

            if not attachment:
                shutil.rmtree(BASE_DIR / 'media' / folder / attachment_id)
    except (Exception,):
        pass


@require_PATCH
@check_remote_ip_allowed
def remove_all_unused_attachments(_):
    remove_attachment_files(OfferAttachment, 'offer_attachments', 'offer_id')
    remove_attachment_files(OrderAttachment, 'order_attachments', 'order_id')
    remove_attachment_files(ChatMessageAttachment, 'message_attachments', 'message_id')

    return 'OK'
