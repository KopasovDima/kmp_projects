import {all, call, put, select, takeEvery, takeLatest} from 'redux-saga/effects'

import {
    ADD_EVENT_PARTICIPANT_NOTIFICATION_REQUEST,
    ADD_EVENT_PARTICIPANT_REQUEST,
    CREATE_EVENT_REQUEST,
    DELETE_EVENT_PARTICIPANT_NOTIFICATION_REQUEST,
    DELETE_EVENT_REQUEST,
    GET_EVENT_PARTICIPANT_NOTIFICATIONS_REQUEST,
    GET_EVENT_PARTICIPANTS_REQUEST,
    GET_EVENT_POSSIBLE_PARTICIPANTS_REQUEST,
    GET_EVENTS_COUNT_REQUEST,
    GET_EVENTS_ON_DATE_REQUEST,
    GET_POSSIBLE_NOTIFICATION_INTERVALS_REQUEST,
    NOTIFY_ALL_PARTICIPANTS_NOW_REQUEST,
    REMOVE_EVENT_PARTICIPANT_REQUEST,
    UPDATE_EVENT_REQUEST,
} from '@/store/actionTypes'
import {processError} from '@/store/sagas/rootSaga.ts'
import {
    getEventParticipantNotificationsAction,
    getEventParticipantsAction,
    getEventsCountAction,
    getEventsOnDateAction,
    onEventParticipantNotificationsResponseAction,
    onEventParticipantsResponseAction,
    onEventPossibleParticipantsResponseAction,
    onEventsCountResponseAction,
    onEventsOnDateResponseAction,
    onPossibleNotificationIntervalsResponseAction,
    onRemoveEventParticipantResponseAction,
} from '@/store/actions'
import {
    addEventParticipantNotificationRequest,
    addEventParticipantRequest,
    createEventRequest,
    deleteEventParticipantNotificationRequest,
    deleteEventRequest,
    getEventParticipantNotificationsRequest,
    getEventParticipantsRequest,
    getEventsCountRequest,
    getEventsOnDateRequest,
    getPossibleNotificationIntervalsRequest,
    getUserProfilesRequest,
    notifyAllParticipantsNowRequest,
    removeEventParticipantRequest,
    updateEventRequest,
} from '@/services'
import {getMonthStartingAndEndingDates} from '@/utils'
import {getCompaniesRequest} from '@/services/companies.ts'

function* getEventsCountSaga(action) {
    try {
        const response = yield call(getEventsCountRequest, action.startDate, action.endDate)
        yield put(onEventsCountResponseAction(response.events_count))
    } catch (error) {
        yield put(onEventsCountResponseAction([]))
        yield call(processError, action, error)
    }
}

function* getEventsOnDateSaga(action) {
    try {
        const response = yield call(getEventsOnDateRequest, action.date)
        yield put(onEventsOnDateResponseAction(response.events))

        if (action.loadParticipants) {
            for (const event of response.events) {
                yield put(getEventParticipantsAction(event.id))
                yield put(getEventParticipantNotificationsAction(event.id))
            }
        }
    } catch (error) {
        yield put(onEventsOnDateResponseAction([]))
        yield call(processError, action, error)
    }
}

function* createEventSaga(action) {
    try {
        const response = yield call(
            createEventRequest,
            action.name,
            action.description,
            action.startDate,
            action.endDate,
            action.link,
            action.color,
        )
        const {startDate, endDate} = getMonthStartingAndEndingDates(response.created_event.start_date)
        yield put(getEventsCountAction(startDate, endDate, false))
        yield put(getEventsOnDateAction(action.getEventsOnDate))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* updateEventSaga(action) {
    try {
        const response = yield call(
            updateEventRequest,
            action.eventId,
            action.name,
            action.description,
            action.startDate,
            action.endDate,
            action.link,
            action.color,
        )
        const {startDate, endDate} = getMonthStartingAndEndingDates(response.updated_event.start_date)
        yield put(getEventsCountAction(startDate, endDate, false))
        yield put(getEventsOnDateAction(action.getEventsOnDate))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* deleteEventSaga(action) {
    try {
        yield call(deleteEventRequest, action.eventId)
        const {eventsOnDate: {events}} = yield select(state => state.events)
        const deletedEvent = events.find(e => e.id === action.eventId)
        const {startDate, endDate} = getMonthStartingAndEndingDates(deletedEvent.start_date)
        yield put(getEventsCountAction(startDate, endDate, false))
        yield put(getEventsOnDateAction(deletedEvent.start_date))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* getEventPossibleParticipantsSaga(action) {
    try {
        const {companies} = yield call(getCompaniesRequest)
        const {user_profiles} = yield call(getUserProfilesRequest)
        yield put(onEventPossibleParticipantsResponseAction(companies, user_profiles))
    } catch (error) {
        yield put(onEventPossibleParticipantsResponseAction([], []))
        yield call(processError, action, error)
    }
}

function* getEventParticipantsSaga(action) {
    try {
        const {participants} = yield call(getEventParticipantsRequest, action.eventId)
        yield put(onEventParticipantsResponseAction(action.eventId, participants))
    } catch (error) {
        yield put(onEventParticipantsResponseAction(action.eventId, []))
        yield call(processError, action, error)
    }
}

function* addEventParticipantSaga(action) {
    try {
        yield call(addEventParticipantRequest, action.eventId, action.companyOrUserId, action.elementType)
        yield put(getEventParticipantsAction(action.eventId))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* removeEventParticipantSaga(action) {
    try {
        yield call(removeEventParticipantRequest, action.participantId)
        yield put(onRemoveEventParticipantResponseAction(action.eventId, action.participantId))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* getPossibleNotificationIntervalsSaga(action) {
    try {
        const response = yield call(getPossibleNotificationIntervalsRequest)
        yield put(onPossibleNotificationIntervalsResponseAction(response.notification_intervals))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* getEventParticipantNotificationsSaga(action) {
    try {
        const response = yield call(getEventParticipantNotificationsRequest, action.eventId)
        yield put(onEventParticipantNotificationsResponseAction(action.eventId, response.notifications))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* addEventParticipantNotificationSaga(action) {
    try {
        yield call(addEventParticipantNotificationRequest, action.eventId, action.notificationIntervalId)
        yield put(getEventParticipantNotificationsAction(action.eventId))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* deleteEventParticipantNotificationSaga(action) {
    try {
        yield call(deleteEventParticipantNotificationRequest, action.eventParticipantNotificationId)
        yield put(getEventParticipantNotificationsAction(action.eventId))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* notifyAllParticipantsNowSaga(action) {
    try {
        yield call(notifyAllParticipantsNowRequest, action.eventId)
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* eventsSagas() {
    yield all([
        takeLatest(GET_EVENTS_COUNT_REQUEST, getEventsCountSaga),
        takeLatest(GET_EVENTS_ON_DATE_REQUEST, getEventsOnDateSaga),
        takeLatest(CREATE_EVENT_REQUEST, createEventSaga),
        takeLatest(UPDATE_EVENT_REQUEST, updateEventSaga),
        takeLatest(DELETE_EVENT_REQUEST, deleteEventSaga),
        takeLatest(GET_EVENT_POSSIBLE_PARTICIPANTS_REQUEST, getEventPossibleParticipantsSaga),
        takeEvery(GET_EVENT_PARTICIPANTS_REQUEST, getEventParticipantsSaga),
        takeLatest(ADD_EVENT_PARTICIPANT_REQUEST, addEventParticipantSaga),
        takeLatest(REMOVE_EVENT_PARTICIPANT_REQUEST, removeEventParticipantSaga),
        takeLatest(GET_POSSIBLE_NOTIFICATION_INTERVALS_REQUEST, getPossibleNotificationIntervalsSaga),
        takeEvery(GET_EVENT_PARTICIPANT_NOTIFICATIONS_REQUEST, getEventParticipantNotificationsSaga),
        takeEvery(ADD_EVENT_PARTICIPANT_NOTIFICATION_REQUEST, addEventParticipantNotificationSaga),
        takeEvery(DELETE_EVENT_PARTICIPANT_NOTIFICATION_REQUEST, deleteEventParticipantNotificationSaga),
        takeEvery(NOTIFY_ALL_PARTICIPANTS_NOW_REQUEST, notifyAllParticipantsNowSaga),
    ])
}

export default eventsSagas