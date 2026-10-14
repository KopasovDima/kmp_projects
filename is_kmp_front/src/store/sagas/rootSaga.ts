import {all, fork, put} from 'redux-saga/effects'

import authSagas from '@/store/sagas/auth.ts'
import budgetsSagas from '@/store/sagas/budgets.ts'
import businessFunctionsSagas from '@/store/sagas/businessFunctions.ts'
import chatsSagas from '@/store/sagas/chats.ts'
import commonSagas from '@/store/sagas/common.ts'
import companiesSagas from '@/store/sagas/companies.ts'
import companySoftwareSagas from '@/store/sagas/companySoftware.ts'
import eventsSagas from '@/store/sagas/events.ts'
import itProjectsSagas from '@/store/sagas/itProjects.ts'
import notificationsSettingsSagas from '@/store/sagas/noitificationsSettings.ts'
import offersSagas from '@/store/sagas/offers.ts'
import ordersSagas from '@/store/sagas/orders.ts'
import purchasesSagas from '@/store/sagas/purchases.ts'
import {refreshTokenAction, requestChangePasswordAction, setErrorAction} from '@/store/actions'

export function* processError(action, error) {
    console.error(error)
    yield put(setErrorAction(action.type, error.error))
    switch (error.status) {
        case 401:
            yield put(refreshTokenAction(action))
            break
        case 403:
            if (error.password_change_required) {
                yield put(requestChangePasswordAction())
            }
            break
    }
}

export function* rootSaga() {
    yield all([
        fork(authSagas),
        fork(budgetsSagas),
        fork(businessFunctionsSagas),
        fork(chatsSagas),
        fork(commonSagas),
        fork(companiesSagas),
        fork(companySoftwareSagas),
        fork(eventsSagas),
        fork(itProjectsSagas),
        fork(notificationsSettingsSagas),
        fork(offersSagas),
        fork(ordersSagas),
        fork(purchasesSagas),
    ])
}