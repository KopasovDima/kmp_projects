import {FC, useCallback, useEffect, useState} from 'react'
import {getHistoryStatisticsRequest, getHostItemsRequest, getHostsRequest} from '@/services'
import {DatePicker, Empty, Flex, Select, Spin, Tooltip} from 'antd'
import './ZabbixStatistics.css'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import {addSecondsToDate} from '@/utils'
import {Column, Line} from '@ant-design/plots'
import {InfoCircleOutlined} from '@ant-design/icons'
import {UPDATE_TIME_15_MIN} from '@/consts'
import {UpdateTimer} from '@/components'
import secureLocalStorage from 'react-secure-storage'

dayjs.locale('ru');

const {RangePicker} = DatePicker;

function formatBytesSize(bytes: number) {
    const k = 1024
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ', 'ПБ', 'ЭБ']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    let precision = 2
    const size = bytes / Math.pow(k, i)
    if (size > 100) precision = 0
    else if (size > 10) precision = 1
    if (i === 0) precision = 0
    return `${size.toFixed(precision)} ${sizes[i]}`
}

const dateToStartDay = (date: Date) => {
    date.setHours(0)
    date.setMinutes(0)
    date.setSeconds(0)
    date.setMilliseconds(0)
    return date
}

const parseNextUpdateInterval = (delay: string) => {
    if (delay === '0') return 60

    const delayNumber = parseInt(delay.slice(0, delay.length - 1))
    const delayName = delay.slice(delay.length - 1)

    switch (delayName) {
        case 's':
            return delayNumber
        case 'm':
            return delayNumber * 60
        case 'h':
            return delayNumber * 60 * 60
        case 'd':
            return delayNumber * 60 * 60 * 24
        case 'w':
            return delayNumber * 60 * 60 * 24 * 7
        default:
            console.error('Unknown delay', delay)
            return 60
    }
}


export const ZabbixStatistics: FC = () => {
    const [nextUpdateDate, setNextUpdateDate] = useState<Date>(addSecondsToDate(new Date(), UPDATE_TIME_15_MIN))

    const [selectedHost, setSelectedHost] = useState<any>(secureLocalStorage.getItem('selectedHost'))
    const [selectedHostItem, setSelectedHostItem] = useState<any>(secureLocalStorage.getItem('selectedHostItem'))
    const [startDate, setStartDate] = useState<any>(dayjs(dateToStartDay(addSecondsToDate(new Date(), -60 * 60 * 24))))
    const [endDate, setEndDate] = useState<any>(dayjs(new Date()))

    const [hosts, setHosts] = useState<[]>([])
    const [hostItems, setHostItems] = useState<[]>([])
    const [statistics, setStatistics] = useState<[]>([])
    const [statisticsLoading, setStatisticsLoading] = useState<boolean>(true)

    const getHosts = useCallback(async () => {
        const hostsResponse = await getHostsRequest()
        if (hostsResponse.hosts?.length > 0) {
            setHosts(hostsResponse.hosts)
            if (!selectedHost) setSelectedHost(hostsResponse.hosts[0])
        }
    }, [])

    const getHostItems = useCallback(async () => {
        if (selectedHost) {
            const hostItemsResponse = await getHostItemsRequest(selectedHost?.hostid)
            if (hostItemsResponse.items?.length > 0) {
                setHostItems(hostItemsResponse.items)
                if (!selectedHostItem) setSelectedHostItem(hostItemsResponse.items[0])
            }
        }
    }, [selectedHost])

    const getHistoryStatistics = useCallback(async () => {
        if (selectedHostItem && startDate && endDate) {
            secureLocalStorage.setItem('selectedHost', selectedHost)
            secureLocalStorage.setItem('selectedHostItem', selectedHostItem)
            setNextUpdateDate(addSecondsToDate(new Date(), parseNextUpdateInterval(selectedHostItem.delay)))
            setStatisticsLoading(true)
            const historyStatisticsResponse = await getHistoryStatisticsRequest(
                selectedHostItem.itemid, selectedHostItem.value_type, startDate.toISOString(), endDate.toISOString()
            )
            setStatistics(historyStatisticsResponse.values)
            setStatisticsLoading(false)
        }
    }, [selectedHost, selectedHostItem, startDate, endDate])

    useEffect(() => {
        getHosts().then().catch()
    }, [])

    useEffect(() => {
        getHostItems().then().catch()
    }, [selectedHost])

    useEffect(() => {
        getHistoryStatistics().then().catch()
    }, [selectedHost, selectedHostItem, startDate, endDate])

    return (
        <div
            style={{
                height: '100%',
                justifyContent: 'center',
                justifySelf: 'center',
                padding: '1rem',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <UpdateTimer
                onUpdate={() => {
                    const newEndDate = dayjs(new Date())
                    newEndDate.set('second', 0)
                    newEndDate.set('millisecond', 0)
                    setEndDate(newEndDate)
                }}
                nextUpdateDate={nextUpdateDate}
            />
            <Flex
                vertical={false}
                justify="center"
            >
                <Flex
                    vertical
                    justify="center"
                    align={'center'}
                >
                    <p>
                        Хост
                        {selectedHost?.description ? (
                            <Tooltip
                                title={selectedHost?.description}
                            >
                                <InfoCircleOutlined
                                    style={{
                                        marginLeft: 20,
                                        color: '#6395b8',
                                        opacity: selectedHost?.description ? 1 : 0,
                                        cursor: 'pointer',
                                    }}
                                />
                            </Tooltip>
                        ) : null}
                    </p>
                    <Select
                        disabled={statisticsLoading}
                        style={{
                            paddingLeft: 20,
                            width: 250,
                            textAlign: 'center',
                        }}
                        styles={{
                            popup: {
                                root: {
                                    textAlign: 'center'
                                },
                            },
                        }}
                        value={selectedHost?.hostid}
                        onChange={(hostId) => {
                            setSelectedHost(hosts.find((h: any) => h.hostid === hostId))
                            setStatisticsLoading(true)
                            setSelectedHostItem(null)
                        }}
                        options={[
                            ...hosts.map((host: any) => ({
                                label: host.name,
                                value: host.hostid,
                                item: host,
                            })),
                        ]}
                        showSearch
                        optionFilterProp={'label'}
                        notFoundContent={'Ничего не найдено'}
                    />
                </Flex>
                <Flex
                    vertical
                    justify="center"
                    align={'center'}
                >
                    <p>
                        Параметр
                        {selectedHostItem?.description ? (
                            <Tooltip
                                title={selectedHostItem?.description}
                            >
                                <InfoCircleOutlined
                                    style={{
                                        marginLeft: 20,
                                        color: '#6395b8',
                                        opacity: selectedHostItem?.description ? 1 : 0,
                                        cursor: 'pointer',
                                    }}
                                />
                            </Tooltip>
                        ) : null}
                    </p>
                    <Select
                        disabled={statisticsLoading}
                        style={{
                            paddingLeft: 20,
                            width: 550,
                            textAlign: 'center',
                        }}
                        styles={{
                            popup: {
                                root: {
                                    textAlign: 'center'
                                },
                            },
                        }}
                        value={selectedHostItem?.itemid}
                        onChange={(itemId) => {
                            setSelectedHostItem(hostItems.find((item: any) => item.itemid === itemId))
                            const newEndDate = dayjs(new Date())
                            newEndDate.set('second', 0)
                            newEndDate.set('millisecond', 0)
                            setEndDate(newEndDate)
                            setStatisticsLoading(true)
                        }}
                        options={[
                            ...hostItems.map((hostItem: any) => ({
                                label: hostItem.name,
                                value: hostItem.itemid,
                                item: hostItem,
                            })),
                        ]}
                        showSearch
                        optionFilterProp={'label'}
                        notFoundContent={'Ничего не найдено'}
                    />
                </Flex>
            </Flex>
            <Flex
                vertical={false}
                justify="center"
            >
                <Flex
                    vertical
                    justify="center"
                    align={'center'}
                >
                    <p>Диапазон дат</p>
                    <RangePicker
                        style={{
                            width: 340,
                        }}
                        format={'DD.MM.YYYY HH:mm'}
                        value={[startDate, endDate]}
                        onChange={(dates) => {
                            const newStartDate = dates?.[0]
                            const newEndDate = dates?.[1]

                            newStartDate?.set('second', 0)
                            newStartDate?.set('millisecond', 0)
                            newEndDate?.set('second', 0)
                            newEndDate?.set('millisecond', 0)

                            setStartDate(newStartDate)
                            setEndDate(newEndDate)
                        }}
                        showTime
                    />
                </Flex>
            </Flex>
            {!statisticsLoading ? (
                statistics?.length > 0 ? (
                    <div className='chartZabbix'>
                        {selectedHostItem.value_type === '0' || selectedHostItem.value_type === '3' ? (
                            <Line
                                title={'Статистика Zabbix'}
                                data={statistics}
                                xField={'date'}
                                yField={'value'}
                                style={{
                                    lineWidth: 2,
                                }}
                                shapeField={'smooth'}
                                axis={{
                                    x: {
                                        // label: false,
                                        title: 'Время',
                                    },
                                    y: {
                                        title: selectedHostItem?.name,
                                    }
                                }}
                                animate={true}
                                tooltip={{
                                    title: (item) =>
                                        (new Date(item.date)).toLocaleDateString() + ' ' + (new Date(item.date)).toLocaleTimeString(),
                                    items: [
                                        (item: any) => {
                                            let valueString
                                            if (selectedHostItem.value_type === '0') valueString = `${item.value?.toFixed(6)}`
                                            else valueString = `${item.value}`

                                            if (selectedHostItem.units) {
                                                if (selectedHostItem.units === 'B') valueString = formatBytesSize(item.value)
                                                else valueString += ' ' + selectedHostItem.units
                                            }

                                            return {
                                                name: 'Значение',
                                                value: valueString,
                                            }
                                        },
                                    ]
                                }}
                            />
                        ) : (
                            <Column
                                title={'Статистика Zabbix'}
                                data={statistics}
                                xField={'date'}
                                yField={'value'}
                                style={{
                                    fill: '#3c7ba8',
                                    radiusTopLeft: 5,
                                    radiusTopRight: 5,
                                    align: 'center',
                                }}
                                axis={{
                                    x: {
                                        // label: false,
                                        title: 'Время',
                                    },
                                    y: {
                                        title: selectedHostItem?.name,
                                    }
                                }}
                                animate={false}
                                tooltip={{
                                    title: (item) =>
                                        (new Date(item.date)).toLocaleDateString() + ' ' + (new Date(item.date)).toLocaleTimeString(),
                                    items: [
                                        (item: any) => {
                                            return {
                                                name: 'Значение',
                                                value: `${item.value} ${selectedHostItem.units || ''}`,
                                            }
                                        },
                                    ]
                                }}
                            />
                        )}
                    </div>
                ) : (
                    <div
                        className={'chartZabbix'}
                        style={{
                            placeSelf: 'center',
                            placeContent: 'center',
                        }}
                    >
                        <Empty
                            description={'Нет данных'}
                        />
                    </div>
                )
            ) : (
                <div
                    className='chartZabbix'
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Spin/>
                </div>
            )}
        </div>
    )
}
