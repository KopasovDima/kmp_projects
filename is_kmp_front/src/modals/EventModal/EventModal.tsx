import {Button, DatePicker, Flex, Input, Modal, TimePicker} from 'antd'
import {FC, useCallback, useEffect, useState} from 'react'
import type {Dayjs} from 'dayjs'
import dayjs from 'dayjs'
import './EventModal.css'
import {RequiredMark} from '@/components'

const EVENT_COLORS = [
    '#afe1ff',
    '#b0c4de',
    '#d8cba0',
    '#e2e8f0',
    '#9ce2cc',
    '#bfd3c1',
    '#c3fcf7',
    '#dbf7ca',
    '#ffc6cd',
    '#fce5c4',
]

interface IEventModalProps {
    title: string
    isOpen: boolean
    onAccept: (
        name: string,
        description: string,
        startDate: Dayjs | undefined,
        endDate: Dayjs | undefined,
        link: string,
        color: string,
    ) => void
    onClose: () => void
    defaultName?: string
    defaultDescription?: string
    defaultDate?: Dayjs
    defaultStartDate?: Dayjs
    defaultEndDate?: Dayjs
    defaultLink?: string
    defaultColor?: string
}

export const EventModal: FC<IEventModalProps> = (
    {
        title,
        isOpen,
        onAccept,
        onClose,
        defaultName = '',
        defaultDescription = '',
        defaultDate = undefined,
        defaultStartDate = undefined,
        defaultEndDate = undefined,
        defaultLink = '',
        defaultColor = EVENT_COLORS[0],
    }
) => {
    const [name, setName] = useState<string>(defaultName)
    const [description, setDescription] = useState<string>(defaultDescription)
    const [date, setDate] = useState<Dayjs | undefined>(defaultDate)
    const [startDate, setStartDate] = useState<Dayjs | undefined>(defaultStartDate)
    const [endDate, setEndDate] = useState<Dayjs | undefined>(defaultEndDate)
    const [link, setLink] = useState<string>(defaultLink)
    const [color, setColor] = useState<string>(defaultColor)

    const onOkPressed = useCallback(() => {
        if (startDate && name && color && date) {
            let updatedStartDate: any = startDate?.year(date.year())?.month(date.month())?.date(date.date())
            let updatedEndDate: any = endDate?.year(date.year())?.month(date.month())?.date(date.date())

            if (endDate && startDate.isAfter(endDate)) {
                [updatedStartDate, updatedEndDate] = [updatedEndDate, updatedStartDate]
            }

            onAccept(
                name,
                description,
                updatedStartDate,
                updatedEndDate,
                link,
                color,
            )
        }
    }, [name, description, date, startDate, endDate, link, color])

    useEffect(() => {
        if (isOpen) {
            setName(defaultName)
            setDescription(defaultDescription)
            setDate(defaultDate)
            setStartDate(defaultStartDate)
            setEndDate(defaultEndDate)
            setLink(defaultLink)
            setColor(defaultColor)
        }
    }, [isOpen])

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
                disabled: !name || !startDate || !date
            }}
            centered
        >
            <div>
                <div className={'modalInputElement'}>
                    <p>Название<RequiredMark/></p>
                    <Input
                        placeholder={'Введите название'}
                        type={'text'}
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        maxLength={200}
                    />
                </div>

                <div className={'modalInputElement'}>
                    <p>Описание</p>
                    <Input.TextArea
                        placeholder={'Введите описание'}
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                        autoSize={{
                            minRows: 4,
                            maxRows: 10,
                        }}
                        maxLength={2000}
                    />
                </div>

                <div className={'modalInputElement'}>
                    <Flex vertical={false} align={'center'}>
                        <p>Дата<RequiredMark/></p>
                        <DatePicker
                            onChange={(newDate) => setDate(newDate)}
                            value={date ? dayjs(date, 'DD.MM.YYYY') : undefined}
                            format={'DD.MM.YYYY'}
                        />
                    </Flex>
                </div>

                <Flex
                    vertical={false}
                    justify={'space-between'}
                    align={'center'}
                >
                    <Flex
                        vertical={false}
                        justify={'space-between'}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <p style={{marginRight: 10}}>С<RequiredMark/></p>
                        <TimePicker
                            styles={{
                                root: {
                                    width: 180,
                                },
                            }}
                            onChange={(newDate) => setStartDate(newDate)}
                            value={startDate ? dayjs(startDate, 'HH:mm') : undefined}
                            format={'HH:mm'}
                            needConfirm={false}
                        />
                    </Flex>

                    <Flex
                        vertical={false}
                        justify={'space-between'}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <p style={{marginRight: 10}}>По</p>
                        <TimePicker
                            styles={{
                                root: {
                                    width: 180,
                                },
                            }}
                            onChange={(newDate) => setEndDate(newDate)}
                            value={endDate ? dayjs(endDate, 'HH:mm') : undefined}
                            format={'HH:mm'}
                            needConfirm={false}
                        />
                    </Flex>
                </Flex>

                <div className={'modalInputElement'}>
                    <p>Ссылка на ВКС</p>
                    <Input
                        placeholder={'Вставьте ссылку на ВКС'}
                        type={'text'}
                        onChange={(e) => setLink(e.target.value)}
                        value={link}
                        maxLength={100}
                    />
                </div>

                <div className={'modalInputElement'}>
                    <p>Цвет</p>
                    <Flex vertical={false} justify={'space-between'}>
                        {EVENT_COLORS.map((c) => (
                            <Button
                                key={c}
                                style={{
                                    margin: 5,
                                    backgroundColor: c,
                                    minWidth: 24,
                                    ...(color === c ? {
                                        outlineStyle: 'solid',
                                        outlineWidth: 2,
                                        outlineColor: '#0018a8',
                                    } : {}),
                                }}
                                size={'small'}
                                shape={'circle'}
                                type={'text'}
                                onClick={() => setColor(c)}
                            />
                        ))}
                    </Flex>
                </div>
            </div>
        </Modal>
    )
}