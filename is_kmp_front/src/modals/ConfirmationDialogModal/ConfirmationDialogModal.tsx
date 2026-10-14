import {Modal} from 'antd'
import {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {getConfirmationDialogSelector} from '@/store/selectors'
import {closeConfirmationDialogAction} from '@/store/actions'

export const ConfirmationDialogModal = () => {
    const {
        isOpen,
        title,
        message,
        onApply,
        applyText,
        onCancel,
        cancelText
    } = useSelector(getConfirmationDialogSelector)
    const dispatch = useDispatch()

    const onApplyModalAction = useCallback(() => {
        if (!isOpen) return

        if (onApply) onApply()
        dispatch(closeConfirmationDialogAction())
    }, [onApply, isOpen])

    const onCancelModalAction = useCallback(() => {
        if (!isOpen) return

        if (onCancel) onCancel()
        dispatch(closeConfirmationDialogAction())
    }, [onCancel, isOpen])

    return (
        <Modal
            zIndex={10000}
            open={isOpen}
            width={400}
            title={title}
            closable={false}
            maskClosable
            onOk={onApplyModalAction}
            okText={applyText}
            cancelText={cancelText}
            onCancel={onCancelModalAction}
            centered
        >
            {/*<KeyboardKeyTracker keys={['Enter']} onPress={onApplyModalAction} />*/}
            <p>{message}</p>
        </Modal>
    )
}