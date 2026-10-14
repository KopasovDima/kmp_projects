import {all, call, put, takeEvery, takeLatest} from 'redux-saga/effects'

import {GET_NOTIFICATIONS_SETTINGS_REQUEST, SET_NOTIFICATION_SETTING_NEW_VALUE_REQUEST,} from '@/store/actionTypes'
import {processError} from '@/store/sagas/rootSaga.ts'
import {onNotificationSettingNewValueAction, onNotificationsSettingsResponseAction} from '@/store/actions'
import {getNotificationsSettingsRequest, setNotificationsUserSettingsNewValueRequest} from '@/services'

function* getNotificationsSettingsSaga(action) {
    try {
        const response = yield call(getNotificationsSettingsRequest)
        yield put(onNotificationsSettingsResponseAction(response.notifications_settings))
    } catch (error) {
        yield put(onNotificationsSettingsResponseAction([]))
        yield call(processError, action, error)
    }
}

function* setNotificationSettingNewValueSaga(action) {
    try {
        const response = yield call(setNotificationsUserSettingsNewValueRequest, action.notificationSettingId, action.newValue)
        yield put(onNotificationSettingNewValueAction(response))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* notificationsSettingsSagas() {
    yield all([
        takeLatest(GET_NOTIFICATIONS_SETTINGS_REQUEST, getNotificationsSettingsSaga),
        takeEvery(SET_NOTIFICATION_SETTING_NEW_VALUE_REQUEST, setNotificationSettingNewValueSaga),
    ])
}

export default notificationsSettingsSagas