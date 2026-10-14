import {DOWNLOAD_FILE, OPEN_NOTIFICATION, REMOVE_NOTIFICATION,} from '@/store/actionTypes'

export const downloadFileAction = (fileUrl: string, fileName: string) => ({
    type: DOWNLOAD_FILE,
    fileUrl,
    fileName,
})

type NotificationType = 'success' | 'error' | 'info' | 'warning'

export const openNotificationAction = (
    message: string,
    description: string,
    {
        duration = 5,
        nType = 'info',
    }: {
        duration?: number
        nType?: NotificationType
    },
) => ({
    type: OPEN_NOTIFICATION,
    message,
    description,
    duration,
    nType,
})

export const removeNotificationAction = (id: string) => ({
    type: REMOVE_NOTIFICATION,
    id,
})
