from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.order import Order


def get_order_by_id_or_exception(order_id: int):
    order = get_order_by_id(order_id)
    if not order:
        raise NotFoundException(f'Не найдено указание с id {order_id}')
    return order


def get_order_by_id(order_id: int):
    return Order.objects.filter(id=order_id).first()
