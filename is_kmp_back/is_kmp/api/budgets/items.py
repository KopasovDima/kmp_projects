from django.db.models import F
from django.views.decorators.http import require_GET, require_POST

from is_kmp.consts.roles import ROLE_ECONOMIST
from is_kmp.exceptions.bad_request_exception import BadRequestException
from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.budget_item import BudgetItem
from is_kmp.models.budget_report import BudgetReport
from is_kmp.models.budget_section_category import BudgetSectionCategory
from is_kmp.utils.decorators import require_role
from is_kmp.utils.request_params import get_request_value_str, get_request_value_int


@require_GET
@require_role(ROLE_ECONOMIST)
def get_budget_items(_, __, ___, ____):
    budget_items = (
        BudgetItem.objects.all()
        .annotate(section_category_name=F('section_category__name'))
        .annotate(section_category_number=F('section_category__number'))
        .annotate(section_name=F('section_category__section__name'))
        .distinct()
        .order_by('id')
    )

    result = {}

    for budget_item in budget_items:
        if budget_item.section_name in result:
            section = result[budget_item.section_name]
        else:
            section = {
                'name': budget_item.section_name,
                'section_categories': {},
            }
            result[budget_item.section_name] = section

        if budget_item.section_category_number in section['section_categories']:
            section_category = section['section_categories'][budget_item.section_category_number]
        else:
            section_category = {
                'name': budget_item.section_category_name,
                'number': budget_item.section_category_number,
                'items': [],
            }
            section['section_categories'][budget_item.section_category_number] = section_category

        section_category['items'].append(budget_item.name)

    return {
        'budget_items': result,
    }


@require_POST
@require_role(ROLE_ECONOMIST)
def create_budget_item(request, _, __, ___):
    item_name = get_request_value_str(request.POST, 'item_name', True)
    section_category_name = get_request_value_str(request.POST, 'section_category_name', True)

    section_category = BudgetSectionCategory.objects.filter(name=section_category_name).first()

    if not section_category:
        raise BadRequestException('Не найдена категория секции бюджета')

    budget_item = BudgetItem()
    budget_item.name = item_name
    budget_item.section_category = section_category

    budget_item.save()

    return 'ОК'


@require_GET
@require_role(ROLE_ECONOMIST)
def get_budget_item_overall_budgets(request, _, user_company_id: int, __, budget_item_name: str):
    year = get_request_value_int(request.GET, 'year', True)

    budget_reports = BudgetReport.objects.filter(company_id=user_company_id, budget_item__name=budget_item_name, year=year)

    if not budget_reports:
        raise NotFoundException(f'Бюджет для элемента "{budget_item_name}" не найден')

    result = {
        'plan': 0,
        'fact': 0,
    }

    for budget_report in budget_reports:
        result[budget_report.fact_or_plan] = (
                budget_report.value_quarter_1 + budget_report.value_quarter_2 +
                budget_report.value_quarter_3 + budget_report.value_quarter_4
        )

    return {
        'budgets': result,
    }
