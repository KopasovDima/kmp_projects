import {CLOSE_CONFIRMATION_DIALOG, OPEN_CONFIRMATION_DIALOG,} from '@/store/actionTypes'

export const openConfirmationDialogAction = (
    {
        title,
        message,
        onApply,
        applyText,
        onCancel,
        cancelText,
    }: {
        title?: string,
        message?: string,
        onApply?: () => void,
        applyText?: string,
        onCancel?: () => void,
        cancelText?: string,
    }
) => ({
    type: OPEN_CONFIRMATION_DIALOG,
    title,
    message,
    onApply,
    applyText,
    onCancel,
    cancelText,
})

export const closeConfirmationDialogAction = () => ({
    type: CLOSE_CONFIRMATION_DIALOG,
})
