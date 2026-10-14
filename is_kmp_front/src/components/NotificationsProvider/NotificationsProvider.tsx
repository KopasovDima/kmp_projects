import {notification} from 'antd'
import {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {removeNotificationAction} from '@/store/actions'
import {getCommonSelector} from "@/store/selectors/common.ts";

export const NotificationsProvider = () => {
    const [api, contextHolder] = notification.useNotification();

    const {openNotifications} = useSelector(getCommonSelector)
    const dispatch = useDispatch()

    useEffect(() => {
        for (const notificationId of Object.keys(openNotifications)) {
            api[openNotifications[notificationId].type]({
                message: openNotifications[notificationId].message,
                description: openNotifications[notificationId].description,
                duration: openNotifications[notificationId].duration,
                showProgress: true,
            })
            dispatch(removeNotificationAction(notificationId))
        }
    }, [openNotifications])


    return <>{contextHolder}</>
}