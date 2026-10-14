import {Input, Modal} from 'antd'
import {FC, useCallback, useEffect, useState} from 'react'
import './OrderModal.css'
import {RequiredMark} from '@/components'

interface IOrderModalProps {
    title: string
    isOpen: boolean
    onAccept: (name: string, description: string) => void
    onClose: () => void
    defaultName?: string
    defaultDescription?: string
}

export const OrderModal: FC<IOrderModalProps> = (
    {
        title,
        isOpen,
        onAccept,
        onClose,
        defaultName = '',
        defaultDescription = '',
    }
) => {
    const [name, setName] = useState<string>(defaultName)
    const [description, setDescription] = useState<string>(defaultDescription)

    const onOkPressed = useCallback(() => {
        if (name && description) {
            onAccept(name, description)
        }
    }, [name, description])

    useEffect(() => {
        if (isOpen) {
            setName(defaultName)
            setDescription(defaultDescription)
        }
    }, [defaultName, defaultDescription, isOpen])

    return (
        <Modal
            open={isOpen}
            width={500}
            onCancel={onClose}
            title={title}
            cancelText={'Отмена'}
            okText={defaultName ? 'Обновить' : 'Создать'}
            closable={false}
            maskClosable={false}
            onOk={onOkPressed}
            okButtonProps={{
                disabled: !name || !description
            }}
            centered
        >
            <div>
                <div className={'modalInputElement'}>
                    <p>Название<RequiredMark/></p>
                    <Input
                        placeholder={'Введите название обязательного указания'}
                        type={'text'}
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        maxLength={200}
                    />
                </div>

                <div className={'modalInputElement'}>
                    <p>Описание<RequiredMark/></p>
                    <Input.TextArea
                        placeholder={'Введите описание обязательного указания'}
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                        autoSize={{
                            minRows: 4,
                            maxRows: 10,
                        }}
                        maxLength={2000}
                    />
                </div>
            </div>
        </Modal>
    )
}