import {all, call, put, takeLatest} from 'redux-saga/effects'
import {processError} from '@/store/sagas/rootSaga.ts'
import {
    getPurchasesYearsAction,
    onCreatePurchaseResponseAction,
    onDeletePurchaseResponseAction,
    onPurchasesResponseAction,
    onPurchasesYearsResponseAction,
    onPurchaseTypesResponseAction,
    onUpdatePurchaseResponseAction,
} from '@/store/actions'
import {
    createPurchaseRequest,
    deletePurchaseRequest,
    getPurchasesRequest,
    getPurchasesYearsRequest,
    getPurchaseTypesRequest,
    updatePurchaseRequest,
} from '@/services'
import {
    CREATE_PURCHASE_REQUEST,
    DELETE_PURCHASE_REQUEST,
    GET_PURCHASE_TYPES_REQUEST,
    GET_PURCHASES_REQUEST,
    GET_PURCHASES_YEARS_REQUEST,
    UPDATE_PURCHASE_REQUEST,
} from '@/store/actionTypes'

function* getPurchasesSaga(action) {
    try {
        const response = yield call(getPurchasesRequest, action.year)
        yield put(onPurchasesResponseAction(response.purchases))
    } catch (error) {
        yield put(onPurchasesResponseAction([]))
        yield call(processError, action, error)
    }
}

function* createPurchaseSaga(action) {
    try {
        const response = yield call(
            createPurchaseRequest,
            action.name,
            action.volume,
            action.cost,
            action.typeId,
            action.startDate,
            action.endDate,
            action.initiator,
            action.initiatorDepartment,
            action.purchaseNumber,
            action.protocolDate,
            action.protocolNumber,
            action.protocolDateFinal,
            action.protocolNumberFinal,
            action.purchaseMethod,
            action.volumeUnit,
            action.requestsNumber,
            action.confirmedRequestsNumber,
            action.supplierName,
            action.supplierINN,
            action.supplierCost,
            action.productType,
            action.supplierType,
            action.agreementNumber,
            action.agreementDate,
            action.registerMonth,
            action.registerNumber,
            action.comment,
        )
        yield put(onCreatePurchaseResponseAction(response.created_purchase))
        yield put(getPurchasesYearsAction())
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* updatePurchaseSaga(action) {
    try {
        const response = yield call(
            updatePurchaseRequest,
            action.purchaseId,
            action.name,
            action.volume,
            action.cost,
            action.typeId,
            action.startDate,
            action.endDate,
            action.initiator,
            action.initiatorDepartment,
            action.purchaseNumber,
            action.protocolDate,
            action.protocolNumber,
            action.protocolDateFinal,
            action.protocolNumberFinal,
            action.purchaseMethod,
            action.volumeUnit,
            action.requestsNumber,
            action.confirmedRequestsNumber,
            action.supplierName,
            action.supplierINN,
            action.supplierCost,
            action.productType,
            action.supplierType,
            action.agreementNumber,
            action.agreementDate,
            action.registerMonth,
            action.registerNumber,
            action.comment,
        )
        yield put(onUpdatePurchaseResponseAction(response.updated_purchase))
        yield put(getPurchasesYearsAction())
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* deletePurchaseSaga(action) {
    try {
        yield call(deletePurchaseRequest, action.purchaseId)
        yield put(onDeletePurchaseResponseAction(action.purchaseId))
        yield put(getPurchasesYearsAction())
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* getPurchaseTypesSaga(action) {
    try {
        const response = yield call(getPurchaseTypesRequest)
        yield put(onPurchaseTypesResponseAction(response.purchase_types))
    } catch (error) {
        yield put(onPurchaseTypesResponseAction([]))
        yield call(processError, action, error)
    }
}

function* getPurchasesYearsSaga(action) {
    try {
        const response = yield call(getPurchasesYearsRequest)
        yield put(onPurchasesYearsResponseAction(response.years))
    } catch (error) {
        yield put(onPurchasesYearsResponseAction([]))
        yield call(processError, action, error)
    }
}

function* purchasesSagas() {
    yield all([
        takeLatest(GET_PURCHASES_REQUEST, getPurchasesSaga),
        takeLatest(CREATE_PURCHASE_REQUEST, createPurchaseSaga),
        takeLatest(UPDATE_PURCHASE_REQUEST, updatePurchaseSaga),
        takeLatest(DELETE_PURCHASE_REQUEST, deletePurchaseSaga),
        takeLatest(GET_PURCHASE_TYPES_REQUEST, getPurchaseTypesSaga),
        takeLatest(GET_PURCHASES_YEARS_REQUEST, getPurchasesYearsSaga),
    ])
}

export default purchasesSagas
