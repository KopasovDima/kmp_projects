from django.db.models import F
from django.views.decorators.http import require_GET, require_POST

from is_kmp.consts.roles import ROLE_ECONOMIST
from is_kmp.exceptions.bad_request_exception import BadRequestException
from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.models.budget_item import BudgetItem
from is_kmp.models.budget_report import BudgetReport
from is_kmp.utils.decorators import require_role, require_auth, require_DELETE
from is_kmp.utils.permissions import check_have_access_to_company
from is_kmp.utils.request_params import get_request_value_int, get_request_value_str


@require_GET
@require_auth
def get_budgets(request, _, user_company_id, __):
    year = get_request_value_int(request.GET, 'year', True)
    fact_or_plan = get_request_value_str(request.GET, 'fact_or_plan') or 'plan'

    current_year_budget = (
        BudgetReport.objects.filter(year=year, company__pk=user_company_id, fact_or_plan=fact_or_plan)
        .annotate(item_name=F('budget_item__name'))
        .annotate(budget_report_id=F('id'))
        .annotate(section_category_name=F('budget_item__section_category__name'))
        .annotate(section_category_number=F('budget_item__section_category__number'))
        .annotate(section_name=F('budget_item__section_category__section__name'))
    ).order_by(
        'budget_item__section_category__section__name',
        'budget_item__section_category__number',
        'budget_item__name',
    )

    result = {}

    for budget in current_year_budget:
        item_name = budget.item_name
        if item_name in result:
            result_item = result[item_name]
        else:
            section_category_name = budget.section_category_name
            section_category_number = budget.section_category_number
            section_name = budget.section_name
            budget_report_id = budget.budget_report_id

            result_item = {
                'section': section_name,
                'category_name': section_category_name,
                'category_number': section_category_number,
                'item_name': item_name,
                'budget_report_id': budget_report_id,
                f'budget_{year}_1q': 0,
                f'budget_{year}_2q': 0,
                f'budget_{year}_3q': 0,
                f'budget_{year}_4q': 0,
                f'budget_{(year - 1)}_plan': 0,
                f'budget_{(year - 1)}_fact': 0,
            }

            result[item_name] = result_item

        result_item[f'budget_{year}_1q'] = budget.value_quarter_1
        result_item[f'budget_{year}_2q'] = budget.value_quarter_2
        result_item[f'budget_{year}_3q'] = budget.value_quarter_3
        result_item[f'budget_{year}_4q'] = budget.value_quarter_4

    prev_year_budget = (
        BudgetReport.objects.filter(year=year - 1, company__pk=user_company_id)
        .values('budget_item__id', 'fact_or_plan')
        .annotate(value_quarter_1=F('value_quarter_1'))
        .annotate(value_quarter_2=F('value_quarter_2'))
        .annotate(value_quarter_3=F('value_quarter_3'))
        .annotate(value_quarter_4=F('value_quarter_4'))
        .annotate(item_name=F('budget_item__name'))
    )

    for budget in prev_year_budget:
        item_name = budget.get('item_name')

        if not item_name in result:
            continue

        result_item = result[item_name]

        result_item[f'budget_{(year - 1)}_{budget.get("fact_or_plan")}'] = (
                budget.get('value_quarter_1') + budget.get('value_quarter_2') +
                budget.get('value_quarter_3') + budget.get('value_quarter_4')
        )

    return {
        'budgets': [value for value in result.values()],
    }


@require_POST
@require_role(ROLE_ECONOMIST)
def save_budget(request, _, user_company_id, __):
    year = get_request_value_int(request.POST, 'year', True)

    budget_report_id = get_request_value_int(request.POST, 'budget_report_id')

    if budget_report_id:
        budget_report = BudgetReport.objects.filter(pk=budget_report_id).first()

        if not budget_report:
            raise NotFoundException(f'Не найден отчёт по бюджету с id {budget_report_id}')

        budget_item_name = get_request_value_str(request.POST, 'item_name')

        if budget_item_name and (not budget_report.budget_item or budget_item_name != budget_report.budget_item.name):
            budget_item = BudgetItem.objects.filter(name=budget_item_name).first()

            if not budget_item:
                raise NotFoundException(f'Не найден элемент бюджета с названием {budget_item_name}')

            existing_budget_report = (
                BudgetReport.objects.filter(
                    year=year,
                    company_id=user_company_id,
                    budget_item_id=budget_item.id,
                    fact_or_plan=budget_report.fact_or_plan,
                ).first()
            )

            if existing_budget_report:
                raise BadRequestException(f'По элементу {budget_item_name} уже существует отчёт')

            budget_report.budget_item = budget_item
    else:
        budget_item_name = get_request_value_str(request.POST, 'item_name', True)

        budget_item = BudgetItem.objects.filter(name=budget_item_name).first()

        if not budget_item:
            raise NotFoundException(f'Не найден элемент бюджета с названием {budget_item_name}')

        fact_or_plan = get_request_value_str(request.POST, 'fact_or_plan', True)

        if fact_or_plan not in ['fact', 'plan']:
            raise BadRequestException('Неверное значение. Для состояния отчёта допустимые значения: "fact" или "plan"')

        budget_report = (
            BudgetReport.objects.filter(
                year=year,
                company_id=user_company_id,
                budget_item_id=budget_item.id,
                fact_or_plan=fact_or_plan,
            ).first()
        )

        if not budget_report:
            budget_report = BudgetReport()
            budget_report.year = year
            budget_report.company_id = user_company_id
            budget_report.budget_item = budget_item
            budget_report.fact_or_plan = fact_or_plan

    value_1q = get_request_value_int(request.POST, '1q')
    value_2q = get_request_value_int(request.POST, '2q')
    value_3q = get_request_value_int(request.POST, '3q')
    value_4q = get_request_value_int(request.POST, '4q')

    budget_report.value_quarter_1 = value_1q if value_1q is not None else 0
    budget_report.value_quarter_2 = value_2q if value_2q is not None else 0
    budget_report.value_quarter_3 = value_3q if value_3q is not None else 0
    budget_report.value_quarter_4 = value_4q if value_4q is not None else 0

    budget_report.save()

    return {
        'budget_report': {
            'id': budget_report.pk,
        },
    }


@require_DELETE
@require_role(ROLE_ECONOMIST)
def remove_budget_report_item(_, __, user_company_id: int, user_roles, budget_report_id: int):
    budget_report = BudgetReport.objects.filter(pk=budget_report_id).first()

    if not budget_report:
        raise NotFoundException(f'Элемент с id {budget_report_id} не найден')

    check_have_access_to_company(user_company_id, budget_report.company_id, user_roles)

    budget_report.delete()

    return 'OK'
