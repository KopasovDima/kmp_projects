import {sendIsKmpRequest} from '@/services'

export const getBudgetRequest = async (year: number) => {
    return await sendIsKmpRequest(`budgets/?year=${year}`, 'GET', null, {UseChildCompanyId: true})
}

export const saveBudgetRequest = async (
    year: number,
    params: {
        factOrPlan?: string
        budgetReportId?: string | number
        itemName?: string
        ['1q']?: number
        ['2q']?: number
        ['3q']?: number
        ['4q']?: number
    }
) => {
    return await sendIsKmpRequest(
        'budgets/save/',
        'POST',
        {
            year,
            ...(params.budgetReportId ? {budget_report_id: params.budgetReportId} : {}),
            ...(params.factOrPlan ? {fact_or_plan: params.factOrPlan} : {}),
            ...(params.itemName ? {item_name: params.itemName} : {}),
            ...(params['1q'] ? {'1q': params['1q']} : {}),
            ...(params['2q'] ? {'2q': params['2q']} : {}),
            ...(params['3q'] ? {'3q': params['3q']} : {}),
            ...(params['4q'] ? {'4q': params['4q']} : {}),
        },
        {UseChildCompanyId: true},
    )
}

export const removeBudgetReportItemRequest = async (budgetReportId: number) => {
    return await sendIsKmpRequest(`budgets/${budgetReportId}/remove/`, 'DELETE')
}


export const getBudgetItemsRequest = async () => {
    return await sendIsKmpRequest(
        `budget_items/`,
        'GET',
    )
}

export const createBudgetItemsRequest = async (itemName: string, sectionCategoryName: string) => {
    return await sendIsKmpRequest(
        `budget_items/create/`,
        'POST',
        {
            item_name: itemName,
            section_category_name: sectionCategoryName,
        },
        {UseChildCompanyId: true},
    )
}

export const getBudgetItemOverallBudgetsRequest = async (year: number, itemName: string) => {
    return await sendIsKmpRequest(
        `budget_items/${itemName}/budgets/?year=${year}`,
        'GET',
        null,
        {UseChildCompanyId: true},
    )
}

