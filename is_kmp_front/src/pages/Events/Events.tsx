import {FC, useCallback, useEffect, useState} from 'react'
import './Events.css'
import {Button, Calendar, Dropdown, Empty, Flex, Popover, Select, Spin} from 'antd'
import type {Dayjs} from 'dayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import {
    BellFilled,
    DeleteOutlined,
    EditOutlined,
    LeftOutlined,
    MinusOutlined,
    MoreOutlined,
    PlusOutlined,
    RightOutlined,
    SendOutlined,
} from '@ant-design/icons'
import {useDispatch, useSelector} from 'react-redux'
import {
    addEventParticipantAction,
    addEventParticipantNotificationAction,
    createEventAction,
    deleteEventAction,
    deleteEventParticipantNotificationAction,
    getEventPossibleParticipantsAction,
    getEventsCountAction,
    getEventsOnDateAction,
    getPossibleNotificationIntervalsAction,
    notifyAllParticipantsNowAction,
    openConfirmationDialogAction,
    removeEventParticipantAction,
    updateEventAction
} from '@/store/actions'
import {getAuthSelector, getEventsSelector} from '@/store/selectors'
import {convertToDateString, convertToTimeString, getMonthStartingAndEndingDates} from '@/utils/date.ts'
import {Tooltip} from '@/components'
import {EventModal} from '@/modals'
import {COLORS} from '@/consts'
import {checkAdmin} from '@/utils'

dayjs.locale('ru')

const monthNames = {
    1: 'Январь',
    2: 'Февраль',
    3: 'Март',
    4: 'Апрель',
    5: 'Май',
    6: 'Июнь',
    7: 'Июль',
    8: 'Август',
    9: 'Сентябрь',
    10: 'Октябрь',
    11: 'Ноябрь',
    12: 'Декабрь',
}

export const Events: FC = () => {
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs(new Date()))
    const [previousSelectedDate, setPreviousSelectedDate] = useState<Dayjs | undefined>(undefined)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [updatingEvent, setUpdatingEvent] = useState<any>(undefined)
    const [popoverParticipantsParams, setPopoverParticipantsParams] = useState<any>({})
    const [dropdownNotificationsParams, setDropdownNotificationsParams] = useState<any>({})

    const {
        eventsCount,
        eventsOnDate,
        eventsParticipants,
        possibleParticipants,
        eventParticipantNotifications,
        possibleNotificationIntervals,
    } = useSelector(getEventsSelector)
    const {userInfo} = useSelector(getAuthSelector)
    const dispatch = useDispatch()

    const isAdmin = checkAdmin(userInfo?.roles)

    useEffect(() => {
        window.document.title = 'Мероприятия'
        dispatch(getEventPossibleParticipantsAction())
        dispatch(getPossibleNotificationIntervalsAction())
    }, [])

    useEffect(() => {
        const {startDate, endDate} = getMonthStartingAndEndingDates(selectedDate)
        dispatch(getEventsCountAction(startDate, endDate, previousSelectedDate?.month() !== selectedDate.month()))
        dispatch(getEventsOnDateAction(selectedDate.toISOString()))
        setPopoverParticipantsParams({})
        setDropdownNotificationsParams({})
    }, [selectedDate])

    const updateDate = useCallback((newDate) => {
        if (newDate.isSame(selectedDate)) return
        setPreviousSelectedDate(selectedDate)
        setSelectedDate(newDate)
    }, [selectedDate])

    const onModalConfirm = useCallback((name, description, startDate, endDate, link, color) => {
        const convertedStartDate = new Date()
        convertedStartDate.setFullYear(startDate.year())
        convertedStartDate.setMonth(startDate.month())
        convertedStartDate.setDate(startDate.date())
        convertedStartDate.setHours(startDate.hour())
        convertedStartDate.setMinutes(startDate.minute())
        convertedStartDate.setSeconds(0)
        convertedStartDate.setMilliseconds(0)

        const convertedEndDate = endDate ? new Date() : undefined
        if (convertedEndDate) {
            convertedEndDate.setFullYear(endDate.year())
            convertedEndDate.setMonth(endDate.month())
            convertedEndDate.setDate(endDate.date())
            convertedEndDate.setHours(endDate.hour())
            convertedEndDate.setMinutes(endDate.minute())
            convertedEndDate.setSeconds(0)
            convertedEndDate.setMilliseconds(0)
        }

        if (updatingEvent) {
            dispatch(updateEventAction(
                updatingEvent.id,
                name, description,
                convertedStartDate.toISOString(),
                convertedEndDate?.toISOString() || '',
                link,
                color,
                selectedDate.toISOString(),
            ))
        } else {
            dispatch(createEventAction(
                name,
                description,
                convertedStartDate.toISOString(),
                convertedEndDate?.toISOString() || '',
                link,
                color,
                selectedDate.toISOString(),
            ))
        }
        setIsModalOpen(false)
        setUpdatingEvent(undefined)
    }, [selectedDate, updatingEvent])

    return (
        <div className={'eventsPage'}>
            <div
                style={{
                    width: 250,
                    backgroundColor: '#ffffff',
                    borderRadius: 10,
                    position: 'absolute',
                }}
            >
                <Calendar
                    value={selectedDate}
                    fullscreen={false}
                    onSelect={(newDate) => updateDate(newDate)}
                    headerRender={() => {
                        return (
                            <Flex
                                vertical={false}
                                justify={'space-between'}
                                style={{
                                    padding: 4,
                                }}
                            >
                                <Button
                                    type={'text'}
                                    onClick={() => updateDate(selectedDate.add(-1, 'month'))}
                                >
                                    <LeftOutlined/>
                                </Button>
                                <span style={{
                                    alignSelf: 'center',
                                    fontSize: 18,
                                    fontWeight: 'bold'
                                }}>{monthNames[selectedDate.month() + 1] + ' ' + selectedDate.year()}</span>
                                <Button
                                    type={'text'}
                                    onClick={() => updateDate(selectedDate.add(1, 'month'))}
                                >
                                    <RightOutlined/>
                                </Button>
                            </Flex>
                        )
                    }}
                    fullCellRender={(current) => {
                        let value = 0

                        if (selectedDate.month() === current.month()) {
                            value = eventsCount.find((e) => e.day === current.date())?.count || 0
                        }

                        const isToday = current.isSame(dayjs(new Date()), 'date')
                        const isSelected = current.isSame(selectedDate, 'date')

                        return (
                            <Tooltip
                                title={value ? `Мероприятий: ${value}` : ''}
                                value={(
                                    <Button
                                        type={'text'}
                                        style={{
                                            width: 18,
                                            minWidth: 18,
                                            height: 26,
                                            cursor: 'pointer',
                                            color: value ? '#00cc0f' : current.month() === selectedDate.month() ? '#111' : '#cdcdcd',
                                            ...(isSelected ? {
                                                backgroundColor: '#d2e4f6',
                                            } : {}),
                                            ...(isToday ? {
                                                outlineColor: '#bac6fa',
                                                outlineWidth: 1,
                                                outlineStyle: 'solid',
                                            } : {}),
                                            ...(value ? {
                                                textDecoration: 'underline',
                                                fontWeight: 'bold',
                                            } : {}),
                                        }}
                                    >
                                        {current.date()}
                                    </Button>
                                )}
                            />
                        )
                    }}
                />
                <Button
                    type={'link'}
                    onClick={() => updateDate(dayjs(new Date()))}
                >
                    Сегодня
                </Button>
            </div>
            <div
                style={{
                    marginLeft: 260,
                    height: 'calc(100vh - 170px)',
                    width: 'calc(100vw - 350px)',
                }}
            >
                <span style={{marginLeft: 20, fontSize: 18}}>Мероприятия - {convertToDateString(selectedDate)}</span>
                {eventsOnDate.isLoading ? (
                    <div
                        style={{
                            height: '100%',
                            width: '100%',
                            placeItems: 'center',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <Spin/>
                    </div>
                ) : !eventsOnDate?.events?.length ? (
                    <div
                        style={{
                            display: 'flex',
                            placeItems: 'center',
                            placeContent: 'center',
                            height: '100%',
                            width: '100%',
                        }}
                    >
                        <Empty description={'Нет мероприятий'}/>
                    </div>
                ) : (
                    <div
                        style={{
                            overflowY: 'auto',
                            height: '100%',
                            width: '100%',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                            gridAutoRows: 'min-content',
                            gap: 10,
                        }}
                    >
                        {eventsOnDate?.events?.map((event) => (
                            <div
                                key={event.id}
                                style={{
                                    padding: 10,
                                    marginTop: 10,
                                    height: 'fit-content',
                                    borderWidth: 1,
                                    borderColor: '#c6c6c6',
                                    borderStyle: 'solid',
                                    borderRadius: 12,
                                    backgroundColor: event.color,
                                    position: 'relative',
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 2,
                                        right: 6,
                                    }}
                                >
                                    <Dropdown
                                        trigger={['click']}
                                        open={!!dropdownNotificationsParams[event.id]?.open}
                                        menu={{
                                            items: possibleNotificationIntervals?.map((interval) => {
                                                const itemSelected = eventParticipantNotifications?.[event.id]?.some((epn) => epn.interval_name === interval.interval_name)

                                                return {
                                                    className: 'notificationsDropdown',
                                                    key: interval.interval_id,
                                                    label: interval.interval_name,
                                                    onClick: () => {
                                                        if (!itemSelected) dispatch(addEventParticipantNotificationAction(event.id, interval.interval_id))
                                                        else dispatch(deleteEventParticipantNotificationAction(event.id, eventParticipantNotifications?.[event.id]?.find((epn) => epn.interval_name === interval.interval_name)?.id))
                                                        setDropdownNotificationsParams({
                                                            ...dropdownNotificationsParams,
                                                            [event.id]: {
                                                                open: true,
                                                            }
                                                        })
                                                    },
                                                    style: {
                                                        backgroundColor: itemSelected ? COLORS.LIGHT_BLUE : 'inherit',
                                                        fontWeight: itemSelected ? 'bold' : 'inherit',
                                                    }
                                                }
                                            })
                                        }}
                                        placement={'bottomRight'}
                                        onOpenChange={(isOpen, {source}) =>
                                            setDropdownNotificationsParams({
                                                ...dropdownNotificationsParams,
                                                [event.id]: {
                                                    open: source === 'trigger' ? isOpen : true,
                                                }
                                            })
                                        }
                                    >
                                        <Tooltip
                                            title={'Отправка уведомлений'}
                                            placement={'left'}
                                            value={(
                                                <BellFilled
                                                    style={{
                                                        color: eventParticipantNotifications?.[event.id]?.length > 0 ? '#20c000' : '#000000',
                                                        marginRight: 10,
                                                    }}
                                                    onClick={() => setDropdownNotificationsParams({
                                                        ...dropdownNotificationsParams,
                                                        [event.id]: {
                                                            open: true,
                                                        }
                                                    })}
                                                />
                                            )}
                                        />
                                    </Dropdown>
                                    {(isAdmin || userInfo?.user_id === event.author_id) ? (
                                        <Dropdown
                                            trigger={['click']}
                                            menu={{
                                                items: [
                                                    {
                                                        key: 'notifyAllNow',
                                                        label: (
                                                            <Tooltip
                                                                value={'Уведомить сейчас'}
                                                                title={'Отправить всем участникам уведомление об изменениях'}
                                                            />
                                                        ),
                                                        onClick: () => dispatch(notifyAllParticipantsNowAction(event.id)),
                                                        icon: <SendOutlined/>,
                                                    },
                                                    {
                                                        key: 'edit',
                                                        label: 'Изменить',
                                                        onClick: () => {
                                                            setUpdatingEvent(event)
                                                            setIsModalOpen(true)
                                                        },
                                                        icon: <EditOutlined/>,
                                                    },
                                                    {
                                                        key: 'delete',
                                                        label: 'Удалить',
                                                        danger: true,
                                                        onClick: () => dispatch(openConfirmationDialogAction({
                                                            title: 'Подтверждение',
                                                            message: `Удалить мероприятие "${event.name}" ?`,
                                                            onApply: () => dispatch(deleteEventAction(event.id)),
                                                            applyText: 'Да',
                                                        })),
                                                        icon: <DeleteOutlined/>,
                                                    }
                                                ],
                                            }}
                                            placement={'bottomRight'}
                                        >
                                            <MoreOutlined/>
                                        </Dropdown>
                                    ) : null}
                                </div>
                                <p style={{marginRight: 30}}>
                                    <span style={{fontSize: 16, fontWeight: 'bold'}}>{event.name}</span>
                                    <span style={{marginLeft: 10, whiteSpace: 'nowrap'}}>
                                        {event.end_date ? 'с ' : 'в '}
                                        {convertToTimeString(event.start_date)}
                                        {event.end_date ? (
                                            ' до ' + convertToTimeString(event.end_date)
                                        ) : ''}
                                    </span>
                                </p>
                                <div>
                                    {event.link ? (
                                        <a
                                            style={{lineBreak: 'anywhere'}}
                                            href={event.link}
                                            target={'_blank'}
                                        >
                                            {event.link}
                                        </a>
                                    ) : null}
                                </div>
                                <Tooltip
                                    value={event.description || ''}
                                    maxLength={300}
                                    showOnlyOnLargeText
                                    placement={'bottomLeft'}
                                />
                                <div>
                                    <span
                                        className={'participantContainer'}
                                        style={{
                                            fontWeight: 'bold',
                                            fontSize: 16,
                                            marginTop: 10,
                                        }}
                                    >
                                        Участники
                                        {(isAdmin || userInfo?.user_id === event.author_id) ? (
                                            <Popover
                                                arrow={false}
                                                content={(
                                                    <Flex vertical align={'flex-end'} style={{ padding: 12 }}>
                                                        <Select
                                                            style={{
                                                                width: 300,
                                                            }}
                                                            showSearch
                                                            placeholder={'Выберите участника'}
                                                            value={popoverParticipantsParams[event.id]?.selected?.value}
                                                            options={[
                                                                ...possibleParticipants?.companies?.filter(c => !eventsParticipants?.[event.id]?.some(ep => ep.company?.id === c.id)),
                                                                ...possibleParticipants?.users?.filter(u => !eventsParticipants?.[event.id]?.some(ep => ep.user?.id === u.id)),
                                                            ]?.map((v) => v.short_name ? {
                                                                label: v.short_name,
                                                                value: `c-${v.id}`,
                                                                id: v.id,
                                                                type: 'company'
                                                            } : {
                                                                label: v.user.last_name + ' ' + v.user.first_name + (v.post ? ` (${v.post})` : ''),
                                                                value: `u-${v.user.id}`,
                                                                id: v.user.id,
                                                                type: 'user'
                                                            })}
                                                            optionFilterProp={'label'}
                                                            onSelect={(_, selected) =>
                                                                setPopoverParticipantsParams({
                                                                    ...popoverParticipantsParams,
                                                                    [event.id]: {
                                                                        isOpen: true,
                                                                        selected: selected,
                                                                    },
                                                                })
                                                            }
                                                        />
                                                        <Button
                                                            type={'primary'}
                                                            size={'small'}
                                                            style={{
                                                                marginTop: 10,
                                                                width: 80,
                                                            }}
                                                            onClick={() => {
                                                                const selected = popoverParticipantsParams[event.id].selected

                                                                setPopoverParticipantsParams({
                                                                    ...popoverParticipantsParams,
                                                                    [event.id]: {
                                                                        isOpen: false,
                                                                        selected: null,
                                                                    },
                                                                })
                                                                dispatch(
                                                                    addEventParticipantAction(
                                                                        event.id,
                                                                        selected.id,
                                                                        selected.type,
                                                                    )
                                                                )
                                                            }}
                                                        >
                                                            Добавить
                                                        </Button>
                                                    </Flex>
                                                )}
                                                open={popoverParticipantsParams[event.id]?.isOpen}
                                                title={<div style={{paddingLeft: 12, paddingTop: 12}}>Добавить участника</div>}
                                                trigger={'click'}
                                                onOpenChange={(isOpen) => setPopoverParticipantsParams({
                                                    ...popoverParticipantsParams,
                                                    [event.id]: {
                                                        ...popoverParticipantsParams[event.id],
                                                        isOpen: isOpen,
                                                    },
                                                })}
                                            >
                                                <Button
                                                    className={'participantButton'}
                                                    type={'primary'}
                                                    size={'small'}
                                                    style={{
                                                        marginLeft: 10,
                                                        backgroundColor: '#4cbd41',
                                                        height: 16,
                                                        width: 16,
                                                        minWidth: 16,
                                                    }}
                                                    shape={'circle'}
                                                    onClick={() => setPopoverParticipantsParams({
                                                        ...popoverParticipantsParams,
                                                        [event.id]: {
                                                            isOpen: true,
                                                            selected: null,
                                                        },
                                                    })}
                                                    icon={<PlusOutlined style={{display: 'flex', fontSize: 10}}/>}
                                                />
                                            </Popover>
                                        ) : null}
                                    </span>
                                    <div>
                                        {eventsParticipants?.[event.id]?.map((eventsParticipant) => (
                                            <div key={eventsParticipant.id} className={'participantContainer'}>
                                                {eventsParticipant?.user?.user.id ? (
                                                    <span>
                                                    {eventsParticipant.user.user.last_name}
                                                        {' '}
                                                        {eventsParticipant.user.user.first_name}
                                                </span>
                                                ) : null}
                                                {eventsParticipant?.company?.id ? (
                                                    <span>{eventsParticipant.company.short_name}</span>
                                                ) : null}
                                                {eventsParticipant?.user?.user?.id === event.author_id ?
                                                    <span style={{marginLeft: 5}}>{'- Организатор'}</span> :
                                                    (isAdmin || userInfo?.user_id === event.author_id) ? (
                                                        <Button
                                                            onClick={() => dispatch(removeEventParticipantAction(event.id, eventsParticipant.id))}
                                                            className={'participantButton'}
                                                            style={{
                                                                marginLeft: 10,
                                                                backgroundColor: '#bd4141',
                                                                height: 16,
                                                                width: 16,
                                                                minWidth: 16,
                                                            }}
                                                            type={'primary'}
                                                            size={'small'}
                                                            shape={'circle'}
                                                            icon={<MinusOutlined
                                                                style={{display: 'flex', fontSize: 6}}/>}
                                                        />
                                                    ) : null}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div
                style={{
                    position: 'absolute',
                    bottom: 10,
                    height: 32,
                    justifyContent: 'center',
                    display: 'flex',
                    width: 'calc(100% - 90px)'
                }}
            >
                <Button
                    onClick={() => setIsModalOpen(true)}
                    type={'dashed'}
                >
                    Создать мероприятие
                </Button>
            </div>

            <EventModal
                title={updatingEvent ? 'Обновить мероприятие' : 'Создать мероприятие'}
                isOpen={isModalOpen}
                onAccept={onModalConfirm}
                onClose={() => {
                    setUpdatingEvent(undefined)
                    setIsModalOpen(false)
                }}
                defaultName={updatingEvent?.name}
                defaultDescription={updatingEvent?.description}
                defaultDate={updatingEvent?.start_date ? dayjs(new Date(updatingEvent?.start_date)) : dayjs(new Date(selectedDate.toISOString()))}
                defaultStartDate={updatingEvent?.start_date ? dayjs((new Date(updatingEvent?.start_date))?.toTimeString()?.substring(0, 5), 'HH:mm') : undefined}
                defaultEndDate={updatingEvent?.end_date ? dayjs((new Date(updatingEvent?.end_date))?.toTimeString()?.substring(0, 5), 'HH:mm') : undefined}
                defaultLink={updatingEvent?.link}
                defaultColor={updatingEvent?.color}
            />
        </div>
    )
}
