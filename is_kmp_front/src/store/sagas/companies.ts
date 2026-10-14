import {all, call, put, takeLatest} from 'redux-saga/effects'

import {GET_AVAILABLE_COMPANIES_REQUEST, GET_COMPANY_BY_ID_REQUEST,} from '@/store/actionTypes'
import {processError} from '@/store/sagas/rootSaga.ts'
import {getAvailableCompaniesRequest, getCompanyByIdRequest} from '@/services/companies.ts'
import {onAvailableCompaniesResponseAction, onCompanyByIdResponseAction} from '@/store/actions'

function* getAvailableCompaniesSaga(action) {
    try {
        const response = yield call(getAvailableCompaniesRequest)
        yield put(onAvailableCompaniesResponseAction(response.companies))
    } catch (error) {
        yield put(onAvailableCompaniesResponseAction([]))
        yield call(processError, action, error)
    }
}

function* getCompanyByIdSaga(action) {
    try {
        const response = yield call(getCompanyByIdRequest, action.companyId)
        yield put(onCompanyByIdResponseAction(action.companyId, response.companies?.[0]))
    } catch (error) {
        yield put(onCompanyByIdResponseAction(action.companyId, {}))
        yield call(processError, action, error)
    }
}

function* companiesSagas() {
    yield all([
        takeLatest(GET_AVAILABLE_COMPANIES_REQUEST, getAvailableCompaniesSaga),
        takeLatest(GET_COMPANY_BY_ID_REQUEST, getCompanyByIdSaga),
    ])
}

export default companiesSagas