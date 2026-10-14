import {
    GET_NOTIFICATIONS_SETTINGS_REQUEST,
    ON_NOTIFICATION_SETTING_NEW_VALUE_RESPONSE,
    ON_NOTIFICATIONS_SETTINGS_RESPONSE,
    SET_NOTIFICATION_SETTING_NEW_VALUE_REQUEST,
} from '@/store/actionTypes'

export const getNotificationsSettingsAction = () => ({
    type: GET_NOTIFICATIONS_SETTINGS_REQUEST,
})

export const onNotificationsSettingsResponseAction = (notificationsSettings: any[]) => ({
    type: ON_NOTIFICATIONS_SETTINGS_RESPONSE,
    notificationsSettings,
})

export const setNotificationSettingNewValueAction = (notificationSettingId: number, newValue: boolean) => ({
    type: SET_NOTIFICATION_SETTING_NEW_VALUE_REQUEST,
    notificationSettingId,
    newValue,
})

export const onNotificationSettingNewValueAction = (notificationSetting: any) => ({
    type: ON_NOTIFICATION_SETTING_NEW_VALUE_RESPONSE,
    notificationSetting,
})
