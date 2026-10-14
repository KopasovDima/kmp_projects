import {Input, Modal} from 'antd'
import {FC, useCallback, useEffect, useState} from 'react'
import {RequiredMark} from '@/components'

export const GroupChatModal: FC<
    {
        title: string
        isOpen: boolean
        onAccept: (name: string) => void
        onClose: () => void
        defaultName?: string
    }
> = (
    {
        title,
        isOpen,
        onAccept,
        onClose,
        defaultName = '',
    }
) => {
    const [name, setName] = useState<string>(defaultName)

    const onOkPressed = useCallback(() => {
        onAccept(name)
    }, [name])

    useEffect(() => {
        if (isOpen) {
            setName(defaultName)
        }
    }, [isOpen, defaultName])

    return (
        <Modal
            open={isOpen}
            width={400}
            onCancel={onClose}
            title={title}
            cancelText={'Отмена'}
            okText={defaultName ? 'Обновить' : 'Создать'}
            closable={false}
            maskClosable={false}
            onOk={onOkPressed}
            okButtonProps={{
                disabled: !name
            }}
            centered
        >
            <div>
                <div style={{marginTop: 15, marginBottom: 15}}>
                    <p>Название<RequiredMark/></p>
                    <Input
                        placeholder={'Введите название'}
                        type={'text'}
                        onChange={(e) => {
                            setName(e.target.value)
                        }}
                        value={name}
                    />
                </div>
            </div>
        </Modal>
    )
}