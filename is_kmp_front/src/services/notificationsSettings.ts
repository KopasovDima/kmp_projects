import {sendIsKmpRequest} from '@/services'

export const getNotificationsSettingsRequest = async () => {
    return await sendIsKmpRequest('settings/notifications/', 'GET')
}

export const setNotificationsUserSettingsNewValueRequest = async (notificationSettingId: number, newValue: boolean) => {
    return await sendIsKmpRequest(
        `settings/notifications/${notificationSettingId}/set_new_value/`,
        'PUT',
        {
            new_value: newValue,
        }
    )
}
