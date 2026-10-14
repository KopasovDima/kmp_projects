from datetime import datetime

from django.http.multipartparser import MultiPartParser
from django.views.decorators.http import require_GET, require_POST

from is_kmp.consts.roles import ROLE_ECONOMIST
from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.purchase import Purchase
from is_kmp.models.purchase_type import PurchaseType
from is_kmp.utils.decimal_utils import convert_decimal
from is_kmp.utils.decorators import require_role, require_auth, require_DELETE, require_PUT
from is_kmp.utils.permissions import check_have_access_to_company
from is_kmp.utils.request_params import get_request_value_int, get_request_value_str, get_request_value_float


@require_GET
@require_auth
def get_purchase_types(_, __, ___, ____):
    purchase_types = PurchaseType.objects.order_by('id')

    result = []

    for purchase_type in purchase_types:
        result.append({
            'id': purchase_type.pk,
            'name': purchase_type.name,
        })

    return {
        'purchase_types': result,
    }


@require_GET
@require_auth
def get_purchases_possible_years(_, __, user_company_id, ___):
    years = Purchase.objects.filter(company_id=user_company_id).values('year').distinct().order_by('year')

    return {
        'years': [year.get('year') for year in years],
    }


@require_GET
@require_auth
def get_purchases(request, _, user_company_id, __):
    year = get_request_value_int(request.GET, 'year')

    purchases = Purchase.objects.filter(company_id=user_company_id)

    if year:
        purchases = purchases.filter(year=year)

    purchases = purchases.order_by('id')

    result = []

    for purchase in purchases:
        result.append({
            'id': purchase.pk,
            'name': purchase.name,
            'volume': purchase.volume,
            'cost': convert_decimal(purchase.cost),
            'type_id': purchase.purchase_type.pk,
            'type_name': purchase.purchase_type.name,
            'start_date': purchase.start_date,
            'end_date': purchase.end_date,

            'initiator': purchase.initiator,
            'initiator_department': purchase.initiator_department,
            'purchase_number': purchase.purchase_number,
            'protocol_date': purchase.protocol_date,
            'protocol_number': purchase.protocol_number,
            'protocol_date_final': purchase.protocol_date_final,
            'protocol_number_final': purchase.protocol_number_final,
            'purchase_method': purchase.purchase_method,
            'volume_unit': purchase.volume_unit,
            'requests_number': purchase.requests_number,
            'confirmed_requests_number': purchase.confirmed_requests_number,
            'supplier_name': purchase.supplier_name,
            'supplier_inn': purchase.supplier_inn,
            'supplier_cost': convert_decimal(purchase.supplier_cost),
            'product_type': purchase.product_type,
            'supplier_type': purchase.supplier_type,
            'agreement_number': purchase.agreement_number,
            'agreement_date': purchase.agreement_date,
            'register_month': purchase.register_month,
            'register_number': purchase.register_number,
            'comment': purchase.comment,
        })

    return {
        'purchases': result,
    }


@require_POST
@require_role(ROLE_ECONOMIST)
def create_purchase(request, _, user_company_id, __):
    name = get_request_value_str(request.POST, 'name', True)
    volume = get_request_value_int(request.POST, 'volume', True)
    cost = get_request_value_float(request.POST, 'cost', True)
    purchase_type_id = get_request_value_int(request.POST, 'purchase_type_id', True)
    start_date = get_request_value_str(request.POST, 'start_date', True)
    end_date = get_request_value_str(request.POST, 'end_date', True)

    initiator = get_request_value_str(request.POST, 'initiator')
    initiator_department = get_request_value_str(request.POST, 'initiator_department')
    purchase_number = get_request_value_str(request.POST, 'purchase_number')
    protocol_date = get_request_value_str(request.POST, 'protocol_date')
    protocol_number = get_request_value_str(request.POST, 'protocol_number')
    protocol_date_final = get_request_value_str(request.POST, 'protocol_date_final')
    protocol_number_final = get_request_value_str(request.POST, 'protocol_number_final')
    purchase_method = get_request_value_str(request.POST, 'purchase_method')
    volume_unit = get_request_value_str(request.POST, 'volume_unit')
    requests_number = get_request_value_int(request.POST, 'requests_number')
    confirmed_requests_number = get_request_value_int(request.POST, 'confirmed_requests_number')
    supplier_name = get_request_value_str(request.POST, 'supplier_name')
    supplier_inn = get_request_value_str(request.POST, 'supplier_inn')
    supplier_cost = get_request_value_float(request.POST, 'supplier_cost')
    product_type = get_request_value_str(request.POST, 'product_type')
    supplier_type = get_request_value_str(request.POST, 'supplier_type')
    agreement_number = get_request_value_str(request.POST, 'agreement_number')
    agreement_date = get_request_value_str(request.POST, 'agreement_date')
    register_month = get_request_value_str(request.POST, 'register_month')
    register_number = get_request_value_str(request.POST, 'register_number')
    comment = get_request_value_str(request.POST, 'comment')

    purchase_type = PurchaseType.objects.filter(pk=purchase_type_id).first()

    if not purchase_type:
        raise NotFoundException(f'Не найден тип закупки с id {purchase_type_id}')

    purchase = Purchase()

    purchase.year = datetime.fromisoformat(start_date).year
    purchase.company_id = user_company_id
    purchase.name = name
    purchase.volume = volume
    purchase.cost = cost
    purchase.purchase_type_id = purchase_type_id
    purchase.start_date = datetime.fromisoformat(start_date)
    purchase.end_date = datetime.fromisoformat(end_date)

    purchase.initiator = initiator
    purchase.initiator_department = initiator_department
    purchase.purchase_number = purchase_number
    purchase.protocol_date = datetime.fromisoformat(protocol_date) if protocol_date else None
    purchase.protocol_number = protocol_number
    purchase.protocol_date_final = datetime.fromisoformat(protocol_date_final) if protocol_date_final else None
    purchase.protocol_number_final = protocol_number_final
    purchase.purchase_method = purchase_method
    purchase.volume_unit = volume_unit
    purchase.requests_number = requests_number
    purchase.confirmed_requests_number = confirmed_requests_number
    purchase.supplier_name = supplier_name
    purchase.supplier_inn = supplier_inn
    purchase.supplier_cost = supplier_cost
    purchase.product_type = product_type
    purchase.supplier_type = supplier_type
    purchase.agreement_number = agreement_number
    purchase.agreement_date = agreement_date
    purchase.register_month = register_month
    purchase.register_number = register_number
    purchase.comment = comment

    purchase.save()

    return {
        'created_purchase': {
            'id': purchase.pk,
            'name': purchase.name,
            'volume': purchase.volume,
            'cost': convert_decimal(purchase.cost),
            'type_id': purchase.purchase_type.pk,
            'type_name': purchase.purchase_type.name,
            'start_date': purchase.start_date,
            'end_date': purchase.end_date,

            'initiator': purchase.initiator,
            'initiator_department': purchase.initiator_department,
            'purchase_number': purchase.purchase_number,
            'protocol_date': purchase.protocol_date,
            'protocol_number': purchase.protocol_number,
            'protocol_date_final': purchase.protocol_date_final,
            'protocol_number_final': purchase.protocol_number_final,
            'purchase_method': purchase.purchase_method,
            'volume_unit': purchase.volume_unit,
            'requests_number': purchase.requests_number,
            'confirmed_requests_number': purchase.confirmed_requests_number,
            'supplier_name': purchase.supplier_name,
            'supplier_inn': purchase.supplier_inn,
            'supplier_cost': convert_decimal(purchase.supplier_cost),
            'product_type': purchase.product_type,
            'supplier_type': purchase.supplier_type,
            'agreement_number': purchase.agreement_number,
            'agreement_date': purchase.agreement_date,
            'register_month': purchase.register_month,
            'register_number': purchase.register_number,
            'comment': purchase.comment,
        },
    }


@require_PUT
@require_role(ROLE_ECONOMIST)
def update_purchase(request, _, user_company_id, user_roles, purchase_id: int):
    data, _ = MultiPartParser(request.META, request, request.upload_handlers).parse()

    name = get_request_value_str(data, 'name', True)
    volume = get_request_value_int(data, 'volume', True)
    cost = get_request_value_float(data, 'cost', True)
    purchase_type_id = get_request_value_int(data, 'purchase_type_id', True)
    start_date = get_request_value_str(data, 'start_date', True)
    end_date = get_request_value_str(data, 'end_date', True)

    initiator = get_request_value_str(data, 'initiator')
    initiator_department = get_request_value_str(data, 'initiator_department')
    purchase_number = get_request_value_str(data, 'purchase_number')
    protocol_date = get_request_value_str(data, 'protocol_date')
    protocol_number = get_request_value_str(data, 'protocol_number')
    protocol_date_final = get_request_value_str(data, 'protocol_date_final')
    protocol_number_final = get_request_value_str(data, 'protocol_number_final')
    purchase_method = get_request_value_str(data, 'purchase_method')
    volume_unit = get_request_value_str(data, 'volume_unit')
    requests_number = get_request_value_int(data, 'requests_number')
    confirmed_requests_number = get_request_value_int(data, 'confirmed_requests_number')
    supplier_name = get_request_value_str(data, 'supplier_name')
    supplier_inn = get_request_value_str(data, 'supplier_inn')
    supplier_cost = get_request_value_float(data, 'supplier_cost')
    product_type = get_request_value_str(data, 'product_type')
    supplier_type = get_request_value_str(data, 'supplier_type')
    agreement_number = get_request_value_str(data, 'agreement_number')
    agreement_date = get_request_value_str(data, 'agreement_date')
    register_month = get_request_value_str(data, 'register_month')
    register_number = get_request_value_str(data, 'register_number')
    comment = get_request_value_str(data, 'comment')

    purchase = Purchase.objects.filter(pk=purchase_id).first()

    if not purchase:
        raise NotFoundException(f'Не найдена закупка с id {purchase_id}')

    purchase_type = PurchaseType.objects.filter(pk=purchase_type_id).first()

    if not purchase_type:
        raise NotFoundException(f'Не найден тип закупки с id {purchase_type_id}')

    check_have_access_to_company(user_company_id, purchase.company_id, user_roles)

    purchase.year = datetime.fromisoformat(start_date).year
    purchase.name = name
    purchase.volume = volume
    purchase.cost = cost
    purchase.purchase_type_id = purchase_type_id
    purchase.start_date = datetime.fromisoformat(start_date)
    purchase.end_date = datetime.fromisoformat(end_date)

    purchase.initiator = initiator
    purchase.initiator_department = initiator_department
    purchase.purchase_number = purchase_number
    purchase.protocol_date = datetime.fromisoformat(protocol_date) if protocol_date else None
    purchase.protocol_number = protocol_number
    purchase.protocol_date_final = datetime.fromisoformat(protocol_date_final) if protocol_date_final else None
    purchase.protocol_number_final = protocol_number_final
    purchase.purchase_method = purchase_method
    purchase.volume_unit = volume_unit
    purchase.requests_number = requests_number
    purchase.confirmed_requests_number = confirmed_requests_number
    purchase.supplier_name = supplier_name
    purchase.supplier_inn = supplier_inn
    purchase.supplier_cost = supplier_cost
    purchase.product_type = product_type
    purchase.supplier_type = supplier_type
    purchase.agreement_number = agreement_number
    purchase.agreement_date = agreement_date
    purchase.register_month = register_month
    purchase.register_number = register_number
    purchase.comment = comment

    purchase.save()

    return {
        'updated_purchase': {
            'id': purchase.pk,
            'name': purchase.name,
            'volume': purchase.volume,
            'cost': convert_decimal(purchase.cost),
            'type_id': purchase.purchase_type.pk,
            'type_name': purchase.purchase_type.name,
            'start_date': purchase.start_date,
            'end_date': purchase.end_date,

            'initiator': purchase.initiator,
            'initiator_department': purchase.initiator_department,
            'purchase_number': purchase.purchase_number,
            'protocol_date': purchase.protocol_date,
            'protocol_number': purchase.protocol_number,
            'protocol_date_final': purchase.protocol_date_final,
            'protocol_number_final': purchase.protocol_number_final,
            'purchase_method': purchase.purchase_method,
            'volume_unit': purchase.volume_unit,
            'requests_number': purchase.requests_number,
            'confirmed_requests_number': purchase.confirmed_requests_number,
            'supplier_name': purchase.supplier_name,
            'supplier_inn': purchase.supplier_inn,
            'supplier_cost': convert_decimal(purchase.supplier_cost),
            'product_type': purchase.product_type,
            'supplier_type': purchase.supplier_type,
            'agreement_number': purchase.agreement_number,
            'agreement_date': purchase.agreement_date,
            'register_month': purchase.register_month,
            'register_number': purchase.register_number,
            'comment': purchase.comment,
        },
    }


@require_DELETE
@require_role(ROLE_ECONOMIST)
def delete_purchase(_, __, user_company_id, user_roles, purchase_id: int):
    purchase = Purchase.objects.filter(pk=purchase_id).first()

    if not purchase:
        raise NotFoundException(f'Не найдена закупка с id {purchase_id}')

    check_have_access_to_company(user_company_id, purchase.company_id, user_roles)

    purchase.delete()

    return 'OK'
