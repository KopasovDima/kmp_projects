import {
    ADD_NEW_EMPTY_ROW,
    CREATE_BUDGET_ITEM_REQUEST,
    GET_BUDGET_ITEMS_REQUEST,
    GET_BUDGET_REQUEST,
    ON_BUDGET_ITEMS_RESPONSE,
    ON_BUDGET_RESPONSE,
    REMOVE_BUDGET_REQUEST,
    SAVE_BUDGET_REQUEST,
} from '@/store/actionTypes'

export const getBudgetAction = (year: number) => ({
    type: GET_BUDGET_REQUEST,
    year,
})

export const onBudgetResponseAction = (budget: any[], year: number) => ({
    type: ON_BUDGET_RESPONSE,
    budget,
    year,
})

export const getBudgetItemsAction = () => ({
    type: GET_BUDGET_ITEMS_REQUEST,
})

export const onBudgetItemsResponseAction = (budgetItems: any[]) => ({
    type: ON_BUDGET_ITEMS_RESPONSE,
    budgetItems,
})

export const createBudgetItemAction = (itemName: string, categoryName: string, onItemCreated: () => void) => ({
    type: CREATE_BUDGET_ITEM_REQUEST,
    itemName,
    categoryName,
    onItemCreated,
})

export const saveBudgetAction = (year, budgetReport, budgetReportId, saveVariant) => ({
    type: SAVE_BUDGET_REQUEST,
    year,
    budgetReport,
    budgetReportId,
    saveVariant,
})

export const removeBudgetAction = (budgetReportId: number) => ({
    type: REMOVE_BUDGET_REQUEST,
    budgetReportId,
})

export const addNewEmptyRowAction = (year: number) => ({
    type: ADD_NEW_EMPTY_ROW,
    year,
})
