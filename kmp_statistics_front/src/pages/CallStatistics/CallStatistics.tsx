import {FC, useCallback, useEffect, useRef, useState} from 'react'
import {
    getCallStatisticsByUserRequest,
    getCallStatisticsPeriodsRequest,
    getCallStatisticsRequest,
    getDepartmentsRequest,
    getUsersRequest
} from '@/services'
import {Empty, Flex, Select, Switch, Tooltip, Typography} from 'antd'
import {Column} from '@ant-design/plots'
import './CallStatistics.css'
import {UpdateTimer} from '@/components'
import {addSecondsToDate} from '@/utils'
import {UPDATE_TIME_15_MIN} from '@/consts'

const { Paragraph } = Typography

const sortValues = (data: [] | undefined = [], yParam: string, sorting: any) => {
    if (!data?.length) return []

    if (data?.length <= 1) return data

    let sortingProp = 'user_name'
    let ascendingValue = 1
    if (sorting === sortingValues.VALUE_ASCENDING)
        sortingProp = yParam
    if (sorting === sortingValues.VALUE_DESCENDING) {
        sortingProp = yParam
        ascendingValue = -1
    }
    if (sorting === sortingValues.DAY)
        sortingProp = 'day'

    const sortNumbers = (v1: number, v2: number) => ascendingValue*v1 - ascendingValue*v2

    const sortStrings = (v1: string, v2: string) => v1.localeCompare(v2)*ascendingValue

    return data.sort((v1, v2) => typeof v1[sortingProp] === 'string' ? sortStrings(v1[sortingProp], v2[sortingProp]) : sortNumbers(v1[sortingProp], v2[sortingProp]))
}

const formatNumber = (value: number) => {
    if (value < 10)
        return '0' + value
    return value
}

const monthTitleName: {[key: number]: string} = {
    1: 'января',
    2: 'февраля',
    3: 'марта',
    4: 'апреля',
    5: 'мая',
    6: 'июня',
    7: 'июля',
    8: 'августа',
    9: 'сентября',
    10: 'октября',
    11: 'ноября',
    12: 'декабря',
}

const formatCallTime = (seconds: number) => {
    if (seconds < 60) {
        return `${formatNumber(seconds)} с`
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${formatNumber(minutes)} м ${formatNumber(remainingSeconds)} с`
    } else if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600)
        const remainingMinutes = Math.floor((seconds % 3600) / 60)
        const remainingSeconds = seconds % 60
        return `${formatNumber(hours)} ч ${formatNumber(remainingMinutes)} м ${formatNumber(remainingSeconds)} с`
    } else {
        const days = Math.floor(seconds / 86400)
        const remainingHours = Math.floor((seconds % 86400) / 3600)
        const remainingMinutes = Math.floor((seconds % 3600) / 60)
        const remainingSeconds = seconds % 60
        return `${formatNumber(days)} д ${formatNumber(remainingHours)} ч ${formatNumber(remainingMinutes)} м ${formatNumber(remainingSeconds)} с`
    }
}

const sortingValues = {
    NAME: 'name',
    DAY: 'day',
    VALUE_ASCENDING: 'value',
    VALUE_DESCENDING: 'valueDesc',
}

const yParams = {
    CALLS_NUMBER: 'count',
    TOTAL_DURATION: 'total_duration',
}

export const CallStatistics: FC = () => {
    const [nextUpdateDate, setNextUpdateDate] = useState<Date>(addSecondsToDate(new Date(), UPDATE_TIME_15_MIN))

    const [selectedUser, setSelectedUser] = useState<number | string>('Общая статистика')
    const [users, setUsers] = useState<{phone_number: number, user_name: string}[]>([])

    const [selectedDepartment, setSelectedDepartment] = useState<number | undefined | string>()
    const [departments, setDepartments] = useState<[]>([])

    const [selectedPeriod, setSelectedPeriod] = useState<any | undefined>(undefined)
    const [periods, setPeriods] = useState<[] | undefined>(undefined)

    const [selectedYParam, setSelectedYParam] = useState<string>(yParams.CALLS_NUMBER)
    const [xParam, setXParam] = useState<string>('user_name')
    const [sorting, setSorting] = useState<string>(sortingValues.NAME)

    const [includeMissingCalls, setIncludeMissingCalls] = useState<boolean>(false)
    const [selectedCallType, setSelectedCallType] = useState<string>('')

    const [renderKey, setRenderKey] = useState<number>(0)

    const [statistics, setStatistics] = useState<[] | undefined>(undefined)

    const userSelectRef = useRef<any>(null)
    const departmentSelectRef = useRef<any>(null)

    const getStatistics = useCallback(async () => {
        if (!selectedPeriod) return

        const statisticsResponse = (
            selectedUser !== 'Общая статистика' ?
                await getCallStatisticsByUserRequest(selectedPeriod.month_code, selectedPeriod.year, selectedUser as number, includeMissingCalls, selectedCallType) :
                await getCallStatisticsRequest(
                    selectedPeriod.month_code,
                    selectedPeriod.year,
                    includeMissingCalls,
                    selectedCallType,
                    selectedDepartment === 'Общая статистика' ? 0 : selectedDepartment,
                )
        )

        setXParam(selectedUser !== 'Общая статистика' ? 'day' : 'user_name')

        if (sorting === sortingValues.DAY && selectedUser === 'Общая статистика' || sorting === sortingValues.NAME && selectedUser !== 'Общая статистика')
            setSorting(selectedUser !== 'Общая статистика' ? sortingValues.DAY : sortingValues.NAME)

        setStatistics(
            sorting !== sortingValues.NAME ?
                sortValues(statisticsResponse.statistics, selectedYParam, sorting) :
                statisticsResponse.statistics,
        )
        setNextUpdateDate(addSecondsToDate(new Date(), UPDATE_TIME_15_MIN))
    }, [selectedPeriod, selectedUser, selectedDepartment, includeMissingCalls, selectedCallType])

    const getPeriods = useCallback(async () => {
        const periodsResponse = await getCallStatisticsPeriodsRequest()
        setPeriods(periodsResponse.periods)
        setSelectedPeriod(periodsResponse.periods?.[0])
    }, [])

    const getUsers = useCallback(async () => {
        const usersResponse = await getUsersRequest()
        setUsers(usersResponse.users)
    }, [])

    const getDepartments = useCallback(async () => {
        const departmentsResponse = await getDepartmentsRequest()
        if (departmentsResponse.departments?.length > 0) {
            setDepartments(departmentsResponse.departments.filter((department: any) => department.sprav_id > 0))
            setSelectedDepartment('Общая статистика')
        }
    }, [])

    useEffect(() => {
        getPeriods().then().catch()
        getUsers().then().catch()
        getDepartments().then().catch()
    }, [])

    useEffect(() => {
        setRenderKey(0)
        getStatistics().then().catch()
    }, [selectedPeriod, selectedUser, selectedDepartment, includeMissingCalls, selectedCallType])

    useEffect(() => {
        setRenderKey(renderKey + 1)
        setStatistics(sortValues(statistics, selectedYParam, sorting) as [])
    }, [sorting, selectedYParam])

    if (!selectedPeriod || !statistics) return

    return (
        <div
            style={{
                height: '100%',
                justifyContent: 'center',
                justifySelf: 'center',
                padding: '2rem',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                marginTop: 20,
            }}
        >
            <UpdateTimer
                onUpdate={() => getStatistics().then().catch()}
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
                    <Paragraph>Период</Paragraph>
                    <Select
                        style={{
                            marginLeft: 20,
                            marginRight: 20,
                            width: 200,
                            textAlign: 'center',
                        }}
                        styles={{
                            popup: {
                                root: {
                                    textAlign: 'center'
                                },
                            },
                        }}
                        value={`${selectedPeriod.year}_${selectedPeriod.month_code}`}
                        options={[
                            ...(
                                periods?.map((period: any) => ({
                                    value: `${period.year}_${period.month_code}`,
                                    label: `${period.month_name} ${period.year}`,
                                })) || []
                            )
                        ]}
                        onChange={(period) => setSelectedPeriod(
                            periods?.find(
                                (p: any) => p.year.toString() === period.split('_')[0] && p.month_code.toString() === period.split('_')[1]
                            )
                        )}
                    />
                </Flex>
                <Flex
                    vertical
                    justify="center"
                    align={'center'}
                >
                    <Paragraph>Параметр</Paragraph>
                    <Select
                        style={{
                            marginLeft: 20,
                            marginRight: 20,
                            width: 350,
                            textAlign: 'center',
                        }}
                        styles={{
                            popup: {
                                root: {
                                    textAlign: 'center'
                                },
                            },
                        }}
                        value={selectedYParam}
                        options={[
                            {
                                value: yParams.CALLS_NUMBER,
                                label: 'Число звонков',
                            },
                            {
                                value: yParams.TOTAL_DURATION,
                                label: 'Продолжительность звонков',
                            }
                        ]}
                        onChange={(param) => {
                            setSelectedYParam(param)
                        }}
                    />
                </Flex>
                <Flex
                    vertical
                    justify="center"
                    align={'center'}
                >
                    <Paragraph>Сортировка</Paragraph>
                    <Select
                        style={{
                            marginLeft: 20,
                            marginRight: 20,
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
                        value={sorting}
                        options={[
                            {
                                value: selectedUser !== 'Общая статистика' ? sortingValues.DAY : sortingValues.NAME,
                                label: selectedUser !== 'Общая статистика' ? 'По дате' : 'По имени',
                            },
                            {
                                value: sortingValues.VALUE_ASCENDING,
                                label: 'По значению (возр)',
                            },
                            {
                                value: sortingValues.VALUE_DESCENDING,
                                label: 'По значению (убыв)',
                            }
                        ]}
                        onChange={(newSorting) => setSorting(newSorting)}
                    />
                </Flex>
                <Flex
                    vertical
                    justify="center"
                    align={'center'}
                >
                    <Tooltip
                        title={'Учитывать в статистике пропущенные звонки?'}
                    >
                        <Paragraph>Пропущенные</Paragraph>
                        <Switch
                            value={includeMissingCalls}
                            onChange={(value) => setIncludeMissingCalls(value)}
                        />
                    </Tooltip>
                </Flex>
            </Flex>
            <Flex
                style={{
                    marginTop: 20,
                }}
                vertical={false}
                justify="center"
            >
                <Flex
                    vertical
                    justify="center"
                    align={'center'}
                >
                    <Paragraph>Тип звонков</Paragraph>
                    <Select
                        style={{
                            marginLeft: 20,
                            marginRight: 20,
                            width: 300,
                            textAlign: 'center',
                        }}
                        styles={{
                            popup: {
                                root: {
                                    textAlign: 'center'
                                },
                            },
                        }}
                        value={selectedCallType}
                        options={[
                            {
                                value: '',
                                label: 'Все звонки',
                            },
                            {
                                value: 'internal_incoming',
                                label: 'Внутренние входящие',
                            },
                            {
                                value: 'internal_outgoing',
                                label: 'Внутренние исходящие',
                            },
                            {
                                value: 'external_incoming',
                                label: 'Внешние входящие',
                            },
                            {
                                value: 'external_outgoing',
                                label: 'Внешние исходящие',
                            },
                        ]}
                        onChange={(callType) => setSelectedCallType(callType)}
                    />
                </Flex>
                <Flex
                    vertical
                    justify="center"
                    align={'center'}
                >
                    <Paragraph>Пользователь</Paragraph>
                    <Select
                        ref={userSelectRef}
                        style={{
                            marginLeft: 20,
                            marginRight: 20,
                            width: 450,
                            textAlign: 'center',
                        }}
                        styles={{
                            popup: {
                                root: {
                                    textAlign: 'center'
                                },
                            },
                        }}
                        disabled={selectedDepartment !== 'Общая статистика'}
                        value={selectedUser}
                        options={[
                            ...(
                                users?.map((user: any) => ({
                                    value: user.phone_number,
                                    label: `${user.user_name} (${user.phone_number})`,
                                })) || []
                            )
                        ]}
                        popupRender={(menu) => (
                            <div>
                                <div
                                    style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        borderBottom: '2px solid #f0f0f0',
                                        backgroundColor: '#fafafa',
                                    }}
                                    onClick={() => {
                                        userSelectRef.current.blur()
                                        setSelectedUser('Общая статистика')
                                    }}
                                >
                                    Общая статистика
                                </div>
                                {menu}
                            </div>
                        )}
                        onChange={(user) => setSelectedUser(user)}
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
                    <Paragraph>Департамент</Paragraph>
                    <Select
                        ref={departmentSelectRef}
                        style={{
                            width: 400,
                            textAlign: 'center',
                        }}
                        styles={{
                            popup: {
                                root: {
                                    textAlign: 'center'
                                },
                            },
                        }}
                        disabled={selectedUser !== 'Общая статистика'}
                        value={selectedDepartment}
                        onChange={(departmentId) => setSelectedDepartment(departmentId)}
                        options={[
                            ...departments.map((department: any) => ({
                                label: department.name,
                                value: department.sprav_id,
                            })),
                        ]}
                        showSearch
                        optionFilterProp={'label'}
                        notFoundContent={'Ничего не найдено'}
                        popupRender={(menu) => (
                            <div>
                                <div
                                    style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        borderBottom: '2px solid #f0f0f0',
                                        backgroundColor: '#fafafa',
                                    }}
                                    onClick={() => {
                                        departmentSelectRef.current.blur()
                                        setSelectedDepartment('Общая статистика')
                                    }}
                                >
                                    Общая статистика
                                </div>
                                {menu}
                            </div>
                        )}
                    />
                </Flex>
            </Flex>
            {statistics.length > 0 ? (
                <div className='chartCall'>
                    <Column
                        title={'Статистика звонков'}
                        key={renderKey}
                        data={statistics}
                        xField={xParam}
                        yField={selectedYParam}
                        style={{
                            fill: '#3c7ba8',
                            radiusTopLeft: 5,
                            radiusTopRight: 5,
                            align: 'center',
                        }}
                        slider={{
                            x: {
                                values: [0, 1]
                            },
                            y: {
                                labelFormatter: (q: any) => {
                                    if (yParams.TOTAL_DURATION === selectedYParam)
                                        return formatCallTime(q)
                                    return `${q}`
                                },
                                values: [0, 1]
                            }
                        }}
                        axis={{
                            x: {
                                label: false,
                            },
                            y: {
                                title: yParams.CALLS_NUMBER === selectedYParam ? 'Число   звонков' : 'Продолжительность   звонков',
                                labelFormatter: (a: any) => {
                                    if (yParams.TOTAL_DURATION === selectedYParam)
                                        return formatCallTime(a)
                                    return a
                                },
                            }
                        }}
                        animate={false}
                        tooltip={{
                            title: (item: any) => {
                                return item.user_name || (item.day + ' ' + monthTitleName[selectedPeriod.month_code])
                            },
                            items: [
                                (item: any) => {
                                    return {
                                        name: 'Звонки',
                                        value: item.count,
                                    }
                                },
                                (item: any) => {
                                    return {
                                        name: 'Продолжительность',
                                        value: formatCallTime(item.total_duration),
                                    }
                                },
                            ]
                        }}
                    />
                </div>
            ) : (
                <div
                    className={'chartCall'}
                    style={{
                        placeSelf: 'center',
                        placeContent: 'center',
                    }}
                >
                    <Empty
                        description={'Нет данных'}
                    />
                </div>
            )}
            {statistics.length > 0 ? (
                <div className='chartCallInfo'>
                    <p
                        style={{
                            marginTop: 20,
                            margin: 2,
                        }}
                    >
                        Общая информация
                    </p>
                    <p
                        style={{
                            margin: 2,
                        }}
                    >
                        Число звонков:{' '}
                        {statistics.reduce((sum, stat) => sum + stat['count'], 0)}
                    </p>
                    <p
                        style={{
                            margin: 2,
                        }}
                    >
                        Продолжительность звонков:{' '}
                        {formatCallTime(statistics.reduce((sum, stat) => sum + stat['total_duration'], 0))}
                    </p>
                </div>
            ) : undefined}
        </div>
    )
}
