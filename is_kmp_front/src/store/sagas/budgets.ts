import {all, call, put, select, takeLatest} from 'redux-saga/effects'

import {
    CREATE_BUDGET_ITEM_REQUEST,
    GET_BUDGET_ITEMS_REQUEST,
    GET_BUDGET_REQUEST,
    REMOVE_BUDGET_REQUEST,
    SAVE_BUDGET_REQUEST,
} from '@/store/actionTypes'
import {processError} from '@/store/sagas/rootSaga.ts'
import {getBudgetItemsAction, onBudgetItemsResponseAction, onBudgetResponseAction} from '@/store/actions'
import {
    createBudgetItemsRequest,
    getBudgetItemOverallBudgetsRequest,
    getBudgetItemsRequest,
    getBudgetRequest,
    removeBudgetReportItemRequest,
    saveBudgetRequest
} from '@/services'

function* getBudgetSaga(action) {
    try {
        const response = yield call(getBudgetRequest, action.year)
        yield put(onBudgetResponseAction(response.budgets, action.year))
    } catch (error) {
        yield put(onBudgetResponseAction([], 0))
        yield call(processError, action, error)
    }
}

function* getBudgetItemsSaga(action) {
    try {
        const response = yield call(getBudgetItemsRequest)
        yield put(onBudgetItemsResponseAction(response.budget_items))
    } catch (error) {
        yield put(onBudgetItemsResponseAction([]))
        yield call(processError, action, error)
    }
}

function* createBudgetItemSaga(action) {
    try {
        yield call(createBudgetItemsRequest, action.itemName, action.categoryName)
        yield put(getBudgetItemsAction())
        action.onItemCreated()
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* removeBudgetSaga(action) {
    try {
        if (action.budgetReportId === 'new') return
        yield call(removeBudgetReportItemRequest, action.budgetReportId)
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* saveBudgetSaga(action) {
    try {
        const response = yield call(saveBudgetRequest, action.year, action.budgetReport)
        const {budget} = yield select(state => state.budgets)

        let updateState = true
        let updatedBudget = {...budget.find((b) => b.budget_report_id === action.budgetReportId)}

        switch (action.saveVariant) {
            case 'NEW_REPORT':
                if (response?.budget_report?.id) {
                    updatedBudget['item_name'] = action.budgetReport.itemName
                    updatedBudget['budget_report_id'] = response?.budget_report?.id

                    try {
                        const prevYearBudget = yield call(
                            getBudgetItemOverallBudgetsRequest,
                            action.year - 1,
                            action.budgetReport.itemName,
                        )
                        if (prevYearBudget?.budgets) {
                            updatedBudget[`budget_${action.year - 1}_plan`] = prevYearBudget.budgets.plan || 0
                            updatedBudget[`budget_${action.year - 1}_fact`] = prevYearBudget.budgets.fact || 0
                        }
                    } catch {
                        /* empty */
                    }
                }
                break
            case 'UPDATE_REPORT_VALUE':
                updateState = false
                break
            case 'CHANGE_ITEM':
                yield call(
                    saveBudgetRequest,
                    action.year - 1,
                    {
                        itemName: action.budgetReport.itemName,
                        factOrPlan: 'fact',
                        ['4q']: updatedBudget[`budget_${action.year - 1}_fact`],
                    },
                )
                try {
                    const prevYearBudget = yield call(
                        getBudgetItemOverallBudgetsRequest,
                        action.year - 1,
                        action.budgetReport.itemName,
                    )
                    if (prevYearBudget?.budgets) {
                        updatedBudget[`budget_${action.year - 1}_plan`] = prevYearBudget.budgets.plan || 0
                        updatedBudget[`budget_${action.year - 1}_fact`] = prevYearBudget.budgets.fact || 0
                    }
                } catch {
                    /* empty */
                }
                break
        }

        if (updateState)
            yield put(onBudgetResponseAction(
                budget.map((b) => b.budget_report_id === action.budgetReportId ? {...updatedBudget} : {...b}),
                action.year,
            ))
    } catch (error) {
        console.log(error)
        yield call(processError, action, error)
    }
}

function* budgetsSagas() {
    yield all([
        takeLatest(GET_BUDGET_REQUEST, getBudgetSaga),
        takeLatest(GET_BUDGET_ITEMS_REQUEST, getBudgetItemsSaga),
        takeLatest(CREATE_BUDGET_ITEM_REQUEST, createBudgetItemSaga),
        takeLatest(REMOVE_BUDGET_REQUEST, removeBudgetSaga),
        takeLatest(SAVE_BUDGET_REQUEST, saveBudgetSaga),
    ])
}

export default budgetsSagas