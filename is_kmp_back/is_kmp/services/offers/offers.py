from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.offer import Offer
from is_kmp.models.offer_comment import OfferComment
from is_kmp.models.offer_last_read_comment import OfferLastReadComment


def get_offer_by_id_or_exception(offer_id: int):
    offer = get_offer_by_id(offer_id)
    if not offer:
        raise NotFoundException(f'Не найдено предложение с id {offer_id}')
    return offer


def get_offer_by_id(offer_id: int):
    return Offer.objects.filter(id=offer_id).first()


def add_last_read_comment(offer_id: int, user_id: int, comment: OfferComment):
    last_read_comment = (
        OfferLastReadComment.objects.filter(offer_id=offer_id, user_id=user_id).order_by('-comment__date').first()
    )
    last_read_comment_date = last_read_comment.comment.date if last_read_comment else None
    if (last_read_comment_date and last_read_comment_date < comment.date) or not last_read_comment:
        OfferLastReadComment.objects.filter(offer_id=offer_id, user_id=user_id).delete()
        OfferLastReadComment(offer_id=offer_id, user_id=user_id, comment_id=comment.pk).save()
