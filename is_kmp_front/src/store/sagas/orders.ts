import {all, call, put, takeEvery, takeLatest} from 'redux-saga/effects'
import {processError} from '@/store/sagas/rootSaga.ts'
import {
    getOrderAttachmentsAction,
    onCreateOrderResponseAction,
    onDeleteOrderResponseAction,
    onOrderAttachmentsResponseAction,
    onOrdersResponseAction,
    onUpdateOrderResponseAction,
} from '@/store/actions'
import {
    addOrderAttachmentsRequest,
    createOrderRequest,
    deleteOrderRequest,
    getOrderAttachmentsRequest,
    getOrdersRequest,
    removeOrderAttachmentsRequest,
    updateOrderRequest,
} from '@/services'
import {
    ADD_ORDER_ATTACHMENTS_REQUEST,
    CREATE_ORDER_REQUEST,
    DELETE_ORDER_REQUEST,
    GET_ORDER_ATTACHMENTS_REQUEST,
    GET_ORDERS_REQUEST,
    REMOVE_ORDER_ATTACHMENTS_REQUEST,
    UPDATE_ORDER_REQUEST,
} from '@/store/actionTypes'

function* getOrdersSaga(action) {
    try {
        const response = yield call(getOrdersRequest)
        yield put(onOrdersResponseAction(response.orders))
    } catch (error) {
        yield put(onOrdersResponseAction([]))
        yield call(processError, action, error)
    }
}

function* createOrderSaga(action) {
    try {
        const response = yield call(createOrderRequest, action.name, action.description)
        yield put(onCreateOrderResponseAction(response.created_order))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* updateOrderSaga(action) {
    try {
        const response = yield call(updateOrderRequest, action.orderId, action.name, action.description)
        yield put(onUpdateOrderResponseAction(response.updated_order))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* deleteOrderSaga(action) {
    try {
        yield call(deleteOrderRequest, action.orderId)
        yield put(onDeleteOrderResponseAction(action.orderId))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* getOrderAttachmentsSaga(action) {
    try {
        const response = yield call(getOrderAttachmentsRequest, action.orderId)
        yield put(onOrderAttachmentsResponseAction(action.orderId, response.attachments))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* addOrderAttachmentsSaga(action) {
    try {
        yield call(addOrderAttachmentsRequest, action.orderId, action.files)
        if (action.loadAttachments) yield put(getOrderAttachmentsAction(action.orderId, true))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* removeOrderAttachmentsSaga(action) {
    try {
        yield call(removeOrderAttachmentsRequest, action.orderId, action.attachmentIds)
        yield put(getOrderAttachmentsAction(action.orderId, true))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* ordersSagas() {
    yield all([
        takeLatest(GET_ORDERS_REQUEST, getOrdersSaga),
        takeLatest(CREATE_ORDER_REQUEST, createOrderSaga),
        takeLatest(UPDATE_ORDER_REQUEST, updateOrderSaga),
        takeLatest(DELETE_ORDER_REQUEST, deleteOrderSaga),
        takeLatest(GET_ORDER_ATTACHMENTS_REQUEST, getOrderAttachmentsSaga),
        takeEvery(ADD_ORDER_ATTACHMENTS_REQUEST, addOrderAttachmentsSaga),
        takeLatest(REMOVE_ORDER_ATTACHMENTS_REQUEST, removeOrderAttachmentsSaga),
    ])
}

export default ordersSagas