import {Input, Modal} from 'antd'
import {FC, useCallback, useEffect, useState} from 'react'
import './OfferModal.css'
import {RequiredMark} from '@/components'

interface IOfferModalProps {
    title: string
    isOpen: boolean
    onAccept: (name: string, description: string, company: string) => void
    onClose: () => void
    defaultName?: string
    defaultDescription?: string
    defaultCompany?: string
}

export const OfferModal: FC<IOfferModalProps> = (
    {
        title,
        isOpen,
        onAccept,
        onClose,
        defaultName = '',
        defaultDescription = '',
        defaultCompany = '',
    }
) => {
    const [name, setName] = useState<string>(defaultName)
    const [description, setDescription] = useState<string>(defaultDescription)
    const [company, setCompany] = useState<string>(defaultCompany)

    const onOkPressed = useCallback(() => {
        if (name && description && company) {
            onAccept(name, description, company)
        }
    }, [name, description, company])

    useEffect(() => {
        if (isOpen) {
            setName(defaultName)
            setDescription(defaultDescription)
            setCompany(defaultCompany)
        }
    }, [defaultName, defaultDescription, defaultCompany, isOpen])

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
                disabled: !name || !description || !company
            }}
            centered
        >
            <div>
                <div className={'modalInputElement'}>
                    <p>Компания<RequiredMark/></p>
                    <Input
                        placeholder={'От какой компании поступило предложение'}
                        type={'text'}
                        onChange={(e) => setCompany(e.target.value)}
                        value={company}
                        maxLength={200}
                    />
                </div>

                <div className={'modalInputElement'}>
                    <p>Название<RequiredMark/></p>
                    <Input
                        placeholder={'Введите название предложения'}
                        type={'text'}
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        maxLength={200}
                    />
                </div>

                <div className={'modalInputElement'}>
                    <p>Описание<RequiredMark/></p>
                    <Input.TextArea
                        placeholder={'Введите описание предложения'}
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