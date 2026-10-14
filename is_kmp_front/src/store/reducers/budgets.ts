import {
    ADD_NEW_EMPTY_ROW,
    GET_BUDGET_REQUEST,
    ON_BUDGET_ITEMS_RESPONSE,
    ON_BUDGET_RESPONSE,
    REMOVE_BUDGET_REQUEST
} from '@/store/actionTypes'

const initialState: {
    budgetItems: any[],
    budget: any[],
    isLoading: boolean,
} = {
    budgetItems: [],
    budget: [],
    isLoading: false,
}

export const budgetsReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case GET_BUDGET_REQUEST: {
            return {
                ...state,
                isLoading: true,
            }
        }
        case ON_BUDGET_RESPONSE: {
            return {
                ...state,
                budget: action.budget.map((row) => ({
                    ...row,
                    [`budget_${action.year - 1}_plan`]: Number.parseFloat(row[`budget_${action.year - 1}_plan`]),
                    [`budget_${action.year - 1}_fact`]: Number.parseFloat(row[`budget_${action.year - 1}_fact`]),
                    [`budget_${action.year}_1q`]: Number.parseFloat(row[`budget_${action.year}_1q`]),
                    [`budget_${action.year}_2q`]: Number.parseFloat(row[`budget_${action.year}_2q`]),
                    [`budget_${action.year}_3q`]: Number.parseFloat(row[`budget_${action.year}_3q`]),
                    [`budget_${action.year}_4q`]: Number.parseFloat(row[`budget_${action.year}_4q`]),
                    [`budget_${action.year}_1half`]: (
                        Number.parseFloat(row[`budget_${action.year}_1q`]) +
                        Number.parseFloat(row[`budget_${action.year}_2q`])
                    ),
                    [`budget_${action.year}_9m`]: (
                        Number.parseFloat(row[`budget_${action.year}_1q`]) +
                        Number.parseFloat(row[`budget_${action.year}_2q`]) +
                        Number.parseFloat(row[`budget_${action.year}_3q`])
                    ),
                    [`budget_${action.year}_total`]: (
                        Number.parseFloat(row[`budget_${action.year}_1q`]) +
                        Number.parseFloat(row[`budget_${action.year}_2q`]) +
                        Number.parseFloat(row[`budget_${action.year}_3q`]) +
                        Number.parseFloat(row[`budget_${action.year}_4q`])
                    ),
                })),
                isLoading: false,
            }
        }
        case ON_BUDGET_ITEMS_RESPONSE: {
            return {
                ...state,
                budgetItems: action.budgetItems,
            }
        }
        case REMOVE_BUDGET_REQUEST: {
            return {
                ...state,
                budget: state.budget.filter(item => item.budget_report_id !== action.budgetReportId),
            }
        }
        case ADD_NEW_EMPTY_ROW: {
            return {
                ...state,
                budget: [
                    ...state.budget,
                    {
                        [`budget_${action.year}_1half`]: 0,
                        [`budget_${action.year}_9m`]: 0,
                        [`budget_${action.year}_total`]: 0,
                        [`budget_${action.year - 1}_fact`]: 0,
                        [`budget_${action.year - 1}_plan`]: 0,
                        [`budget_${action.year}_1q`]: 0,
                        [`budget_${action.year}_2q`]: 0,
                        [`budget_${action.year}_3q`]: 0,
                        [`budget_${action.year}_4q`]: 0,
                        category_name: undefined,
                        category_number: undefined,
                        item_name: undefined,
                        budget_report_id: 'new',
                        section: undefined,
                    }
                ],
            }
        }
        default:
            return {...state}
    }
}