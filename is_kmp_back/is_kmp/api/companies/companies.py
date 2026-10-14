from django.views.decorators.http import require_GET

from is_kmp.models.company import Company
from is_kmp.services.companies.companies import get_company_with_all_children
from is_kmp.utils.decorators import require_auth, handle_request
from is_kmp.utils.permissions import check_admin
from is_kmp.utils.request_params import get_request_value_int


@require_GET
@require_auth
def get_available_companies(_, __, user_company_id: int, user_roles):
    if not check_admin(user_roles):
        companies = get_company_with_all_children(user_company_id)
    else:
        companies = Company.objects.all().order_by('id')

    result = []

    for company in companies:
        result.append({
            'id': company.id,
            'name': company.name,
            'short_name': company.short_name,
            'parent_id': company.parent.id if company.parent else None,
            'logo_url': company.logo_url,
        })

    return {
        'companies': result,
    }


@require_GET
@handle_request
def get_companies(request):
    company_id = get_request_value_int(request.GET, 'company_id')

    companies = Company.objects.all()

    if company_id:
        companies = companies.filter(id=company_id)

    companies = companies.order_by('short_name')

    result = []

    for company in companies:
        result.append({
            'id': company.id,
            'name': company.name,
            'short_name': company.short_name,
            'status': company.status,
            'level': company.level,
            'logo_url': company.logo_url,
        })

    return {
        'companies': result,
    }
