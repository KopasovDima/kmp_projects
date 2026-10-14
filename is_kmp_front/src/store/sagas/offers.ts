import {all, call, put, takeEvery, takeLatest} from 'redux-saga/effects'
import {processError} from '@/store/sagas/rootSaga.ts'
import {
    getOfferAttachmentsAction,
    onCreateOfferResponseAction,
    onDeleteOfferResponseAction,
    onOfferAttachmentsResponseAction,
    onOfferCommentsResponseAction,
    onOffersResponseAction,
    onUnreadOffersCountResponseAction,
    onUpdateOfferResponseAction,
} from '@/store/actions'
import {
    addOfferAttachmentsRequest,
    createOfferRequest,
    deleteOfferRequest,
    getCommentsRequest,
    getOfferAttachmentsRequest,
    getOffersRequest,
    getUnreadOffersCountRequest,
    readCommentRequest,
    removeOfferAttachmentsRequest,
    updateOfferRequest,
    writeOfferCommentRequest,
} from '@/services'
import {
    ADD_OFFER_ATTACHMENTS_REQUEST,
    CREATE_OFFER_REQUEST,
    DELETE_OFFER_REQUEST,
    GET_OFFER_ATTACHMENTS_REQUEST,
    GET_OFFER_COMMENTS_REQUEST,
    GET_OFFERS_REQUEST,
    GET_UNREAD_OFFERS_COUNT_REQUEST,
    READ_COMMENT_REQUEST,
    REMOVE_OFFER_ATTACHMENTS_REQUEST,
    SEND_COMMENT_REQUEST,
    UPDATE_OFFER_REQUEST,
} from '@/store/actionTypes'

function* getOffersSaga(action) {
    try {
        const response = yield call(getOffersRequest)
        yield put(onOffersResponseAction(response.offers))
    } catch (error) {
        yield put(onOffersResponseAction([]))
        yield call(processError, action, error)
    }
}

function* createOfferSaga(action) {
    try {
        const response = yield call(createOfferRequest, action.name, action.description, action.company)
        yield put(onCreateOfferResponseAction(response.created_offer))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* updateOfferSaga(action) {
    try {
        const response = yield call(updateOfferRequest, action.offerId, action.name, action.description, action.company)
        yield put(onUpdateOfferResponseAction(response.updated_offer))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* deleteOfferSaga(action) {
    try {
        yield call(deleteOfferRequest, action.offerId)
        yield put(onDeleteOfferResponseAction(action.offerId))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* getOfferCommentsSaga(action) {
    try {
        const response = yield call(getCommentsRequest, action.offerId)
        yield put(onOfferCommentsResponseAction(response.comments, response.last_read_comment_id))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* sendCommentSaga(action) {
    try {
        yield call(writeOfferCommentRequest, action.offerId, action.comment, action.parentCommentId)
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* readCommentSaga(action) {
    try {
        yield call(readCommentRequest, action.offerId, action.commentId, action.readAllCommentsBefore)
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* getUnreadOffersCountSaga(action) {
    try {
        const response = yield call(getUnreadOffersCountRequest)
        yield put(onUnreadOffersCountResponseAction(response.comments_count))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* getOfferAttachmentsSaga(action) {
    try {
        const response = yield call(getOfferAttachmentsRequest, action.offerId)
        yield put(onOfferAttachmentsResponseAction(action.offerId, response.attachments))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* addOfferAttachmentsSage(action) {
    try {
        yield call(addOfferAttachmentsRequest, action.offerId, action.files)
        if (action.loadAttachments) yield put(getOfferAttachmentsAction(action.offerId, true))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* removeOfferAttachmentsSaga(action) {
    try {
        yield call(removeOfferAttachmentsRequest, action.offerId, action.attachmentIds)
        yield put(getOfferAttachmentsAction(action.offerId, true))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* offersSagas() {
    yield all([
        takeLatest(GET_OFFERS_REQUEST, getOffersSaga),
        takeLatest(CREATE_OFFER_REQUEST, createOfferSaga),
        takeLatest(UPDATE_OFFER_REQUEST, updateOfferSaga),
        takeLatest(DELETE_OFFER_REQUEST, deleteOfferSaga),
        takeLatest(GET_OFFER_COMMENTS_REQUEST, getOfferCommentsSaga),
        takeLatest(SEND_COMMENT_REQUEST, sendCommentSaga),
        takeLatest(READ_COMMENT_REQUEST, readCommentSaga),
        takeLatest(GET_UNREAD_OFFERS_COUNT_REQUEST, getUnreadOffersCountSaga),
        takeLatest(GET_OFFER_ATTACHMENTS_REQUEST, getOfferAttachmentsSaga),
        takeEvery(ADD_OFFER_ATTACHMENTS_REQUEST, addOfferAttachmentsSage),
        takeLatest(REMOVE_OFFER_ATTACHMENTS_REQUEST, removeOfferAttachmentsSaga),
    ])
}

export default offersSagas