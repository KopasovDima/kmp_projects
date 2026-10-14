import {OPEN_NOTIFICATION, REMOVE_NOTIFICATION} from '@/store/actionTypes'

const initialState: {
    openNotifications: {
        [key: string]: any
    }
} = {
    openNotifications: {},
}

export const commonReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case OPEN_NOTIFICATION: {
            const notificationId = `notification${new Date().getTime()}_${Math.round(Math.random() * 100000)}`

            return {
                ...state,
                openNotifications: {
                    ...state.openNotifications,
                    [notificationId]: {
                        message: action.message,
                        description: action.description,
                        duration: action.duration,
                        type: action.nType,
                    }
                },
            }
        }
        case REMOVE_NOTIFICATION: {
            const newOpenNotifications = {...state.openNotifications}
            if (action.id in newOpenNotifications) delete newOpenNotifications[action.id]
            return {
                ...state,
                openNotifications: newOpenNotifications,
            }
        }
        default:
            return {...state}
    }
}