import {
    ON_NOTIFICATION_SETTING_NEW_VALUE_RESPONSE,
    ON_NOTIFICATIONS_SETTINGS_RESPONSE,
    SET_NOTIFICATION_SETTING_NEW_VALUE_REQUEST
} from '@/store/actionTypes'

const initialState: {
    notificationsSettings: any[]
} = {
    notificationsSettings: [],
}

export const notificationsSettingsReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case ON_NOTIFICATIONS_SETTINGS_RESPONSE: {
            return {
                notificationsSettings: action.notificationsSettings,
            }
        }
        case SET_NOTIFICATION_SETTING_NEW_VALUE_REQUEST: {
            return {
                notificationsSettings: state.notificationsSettings.map((notificationSetting) => {
                    return notificationSetting.id === action.notificationSettingId ? {
                        ...notificationSetting,
                        isLoading: true,
                    } : notificationSetting
                }),
            }
        }
        case ON_NOTIFICATION_SETTING_NEW_VALUE_RESPONSE: {
            return {
                notificationsSettings: state.notificationsSettings.map((notificationSetting) => {
                    return notificationSetting.id === action.notificationSetting?.id ? {
                        ...notificationSetting,
                        ...action.notificationSetting,
                        isLoading: false,
                    } : notificationSetting
                }),
            }
        }
        default:
            return {...state}
    }
}