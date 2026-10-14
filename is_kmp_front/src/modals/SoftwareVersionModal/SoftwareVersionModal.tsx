import {Input, Modal} from 'antd'
import {FC, useCallback, useEffect, useState} from 'react'
import {RequiredMark} from '@/components'

export const SoftwareVersionModal: FC<
    {
        title: string
        isOpen: boolean
        onAccept: (version: string) => void
        onClose: () => void
        defaultVersion?: string
        validateSoftwareVersion?: (version: string) => string
    }
> = (
    {
        title,
        isOpen,
        onAccept,
        onClose,
        defaultVersion = '',
        validateSoftwareVersion = () => '',
    }
) => {
    const [version, setVersion] = useState<string>(defaultVersion)
    const [versionError, setVersionError] = useState<string>('')

    const onOkPressed = useCallback(() => {
        onAccept(version)
    }, [version])

    useEffect(() => {
        if (isOpen) {
            setVersion(defaultVersion)
            setVersionError('')
        }
    }, [isOpen, defaultVersion])

    return (
        <Modal
            zIndex={2500}
            open={isOpen}
            width={400}
            onCancel={onClose}
            title={title}
            cancelText={'Отмена'}
            okText={'Добавить'}
            closable={false}
            maskClosable={false}
            onOk={onOkPressed}
            okButtonProps={{
                disabled: !version || !!versionError
            }}
            centered
        >
            <div>
                <div style={{marginTop: 15, marginBottom: 15}}>
                    <p>Версия ПО<RequiredMark/></p>
                    <Input
                        placeholder={'Введите версию'}
                        type={'text'}
                        onChange={(e) => {
                            setVersionError(validateSoftwareVersion(e.target.value?.trim()))
                            setVersion(e.target.value)
                        }}
                        value={version}
                        status={versionError ? 'error' : ''}
                    />
                </div>
                {versionError ? (
                    <p style={{color: '#fd4c4e', fontSize: 12}}>{versionError}</p>
                ) : null}
            </div>
        </Modal>
    )
}
