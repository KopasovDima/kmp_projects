import {CLOSE_CONFIRMATION_DIALOG, OPEN_CONFIRMATION_DIALOG} from '@/store/actionTypes'

const initialState: {
    isOpen: boolean,
    title: string,
    message: string,
    onApply?: () => void
    applyText?: string
    onCancel?: () => void
    cancelText?: string
} = {
    isOpen: false,
    title: '',
    message: '',
    onApply: undefined,
    applyText: '',
    onCancel: undefined,
    cancelText: '',
}

export const confirmationDialogReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case OPEN_CONFIRMATION_DIALOG: {
            return {
                isOpen: true,
                title: action.title,
                message: action.message,
                onApply: action.onApply,
                applyText: action.applyText,
                onCancel: action.onCancel,
                cancelText: action.cancelText,
            }
        }
        case CLOSE_CONFIRMATION_DIALOG: {
            return initialState
        }
        default:
            return {...state}
    }
}