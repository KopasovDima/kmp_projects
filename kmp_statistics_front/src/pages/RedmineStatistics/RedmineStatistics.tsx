import {FC, useCallback, useEffect, useRef, useState} from 'react'
import {getPeriodsRequest, getRedminePersonsRequest, getRedmineStatisticsRequest} from '@/services'
import {Empty, Flex, Select, Typography} from 'antd'
import {Column} from '@ant-design/plots'
import './RedmineStatistics.css'
import {addSecondsToDate} from '@/utils'
import {UPDATE_TIME_15_MIN} from '@/consts'
import {UpdateTimer} from '@/components'

const {Paragraph} = Typography

const personTypes = {
    ASSIGNED_TO: 'assigned_to',
    AUTHOR: 'author',
}

export const RedmineStatistics: FC = () => {
    const [nextUpdateDate, setNextUpdateDate] = useState<Date>(addSecondsToDate(new Date(), UPDATE_TIME_15_MIN))

    const [selectedPerson, setSelectedPerson] = useState<string>('Общая статистика')
    const [persons, setPersons] = useState<string[]>([])

    const [periods, setPeriods] = useState<[] | undefined>(undefined)
    const [selectedYear, setSelectedYear] = useState<any | undefined>(undefined)
    const [selectedMonth, setSelectedMonth] = useState<{ month_code: string, month_name: string }>({
        month_code: '',
        month_name: 'Весь год',
    })
    const [years, setYears] = useState<string[] | undefined>(undefined)
    const [months, setMonths] = useState([])

    const [selectedPersonType, setSelectedPersonType] = useState<string>(personTypes.ASSIGNED_TO)
    const [selectedIssueStatus, setSelectedIssueStatus] = useState<string>('')

    const [renderKey, setRenderKey] = useState<number>(0)

    const [statistics, setStatistics] = useState<[] | undefined>(undefined)

    const userSelectRef = useRef<any>(null)

    const getStatistics = useCallback(async () => {
        if (!selectedYear) return

        const statisticsResponse = (
            await getRedmineStatisticsRequest(
                selectedYear,
                selectedMonth.month_code,
                selectedPersonType,
                selectedPerson === 'Общая статистика' ? '' : selectedPerson,
                selectedIssueStatus,
            )
        )

        setStatistics(statisticsResponse.statistics)
        setNextUpdateDate(addSecondsToDate(new Date(), UPDATE_TIME_15_MIN))
    }, [selectedYear, selectedMonth, selectedPerson, selectedPersonType, selectedIssueStatus])

    const getPeriods = useCallback(async () => {
        const periodsResponse = await getPeriodsRequest()
        setPeriods(periodsResponse.periods)
        const _years = Object.keys(
            periodsResponse.periods?.reduce((result: any, period: any) => {
                if (!result[period.year]) result[period.year] = period.year
                return result
            }, {}) || []
        ).reverse()
        setYears(_years)
        setSelectedYear(_years[0])
    }, [])

    const getPersons = useCallback(async () => {
        const personsResponse = await getRedminePersonsRequest()
        setPersons(personsResponse.persons)
    }, [])

    useEffect(() => {
        getPeriods().then().catch()
        getPersons().then().catch()
    }, [])

    useEffect(() => {
        getStatistics().then().catch()
        setRenderKey(renderKey + 1)
    }, [selectedYear, selectedMonth, selectedPerson, selectedPersonType, selectedIssueStatus])

    useEffect(() => {
        const monthsInYear = (
            periods?.filter((period: any) => period.year == selectedYear)?.reduce((result: any, period: any) => {
                if (!result[period.month_code]) result[period.month_code] = period.month_name
                return result
            }, {}) || []
        )
        setMonths(monthsInYear)
        if (!Object.keys(monthsInYear).find((month) => month === selectedMonth.month_code)) {
            if (selectedMonth.month_code !== '')
                setSelectedMonth({
                    month_code: Object.keys(monthsInYear)[0],
                    month_name: Object.values(monthsInYear)[0] as string,
                })
        } else {
            // Запрос?
        }
        setRenderKey(renderKey + 1)
    }, [selectedYear])

    if (!selectedYear || !selectedMonth || !statistics) return

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
                    <Paragraph>Год</Paragraph>
                    <Select
                        style={{
                            marginLeft: 20,
                            marginRight: 20,
                            width: 100,
                            textAlign: 'center',
                        }}
                        styles={{
                            popup: {
                                root: {
                                    textAlign: 'center'
                                },
                            },
                        }}
                        value={selectedYear}
                        options={[
                            ...(
                                years?.map((year: any) => ({
                                    value: year,
                                    label: year,
                                })) || []
                            )
                        ]}
                        onChange={(year) => setSelectedYear(year)}
                    />
                </Flex>
                <Flex
                    vertical
                    justify="center"
                    align={'center'}
                >
                    <Paragraph>Месяц</Paragraph>
                    <Select
                        style={{
                            marginLeft: 20,
                            marginRight: 20,
                            width: 150,
                            textAlign: 'center',
                        }}
                        styles={{
                            popup: {
                                root: {
                                    textAlign: 'center'
                                },
                            },
                        }}
                        value={selectedMonth.month_code}
                        options={[
                            {
                                value: '',
                                label: 'Весь год',
                            },
                            ...(
                                Object.keys(months || []).map((month: any) => ({
                                    value: month,
                                    label: months?.[month],
                                })) || []
                            )
                        ]}
                        onChange={(month: any) =>
                            setSelectedMonth({
                                month_code: month,
                                month_name: month ? months[month] : 'Весь год',
                            })
                        }
                        disabled={selectedPerson !== 'Общая статистика'}
                    />
                </Flex>
                <Flex
                    vertical
                    justify="center"
                    align={'center'}
                >
                    <Paragraph>Роль</Paragraph>
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
                        value={selectedPersonType}
                        options={[
                            {
                                value: personTypes.AUTHOR,
                                label: 'Автор',
                            },
                            {
                                value: personTypes.ASSIGNED_TO,
                                label: 'Назначена',
                            }
                        ]}
                        onChange={(personType) => setSelectedPersonType(personType)}
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
                        value={selectedPerson}
                        options={[
                            ...(
                                persons?.map((person: any) => ({
                                    value: person,
                                    label: person,
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
                                        setSelectedPerson('Общая статистика')
                                    }}
                                >
                                    Общая статистика
                                </div>
                                {menu}
                            </div>
                        )}
                        onChange={(user) => {
                            setSelectedPerson(user)
                            if (selectedMonth) {
                                setSelectedMonth({
                                    month_code: '',
                                    month_name: 'Весь год',
                                })
                            }
                        }}
                        showSearch
                        optionFilterProp={'label'}
                        notFoundContent={'Ничего не найдено'}
                    />
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
                    <Paragraph>Статус задач</Paragraph>
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
                        value={selectedIssueStatus}
                        options={[
                            {
                                value: '',
                                label: 'Все',
                            },
                            {
                                value: 'В работе',
                                label: 'В работе',
                            },
                            {
                                value: 'Закрыта',
                                label: 'Закрытые',
                            },
                            {
                                value: 'Новая',
                                label: 'Новые',
                            },
                            {
                                value: 'Отклонена',
                                label: 'Отклонены',
                            },
                        ]}
                        onChange={(issueStatus) => setSelectedIssueStatus(issueStatus)}
                    />
                </Flex>
            </Flex>
            {statistics.length > 0 ? (
                <div className='chartRedmine'>
                    <Column
                        title={'Статистика задач ДИТ (Redmine)'}
                        key={renderKey}
                        data={statistics}
                        xField={selectedPerson !== 'Общая статистика' ? 'month' : `${selectedPersonType}_name`}
                        yField={'issues_count'}
                        seriesField={(selectedPerson !== 'Общая статистика' || selectedMonth.month_code) ? undefined : 'month'}
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
                                values: [0, 1]
                            }
                        }}
                        axis={{
                            x: {
                                label: false,
                            },
                            y: {
                                title: 'Число задач',
                            }
                        }}
                        animate={false}
                        tooltip={{
                            title: (item: any) => item[`${selectedPersonType}_name`] || 'Отсутствует',
                            items: [
                                (item: any) => {
                                    return {
                                        name: (
                                            selectedMonth.month_code ?
                                                'Задачи' :
                                                'Задачи - ' + months[item.month]
                                        ),
                                        value: item.issues_count,
                                    }
                                },
                            ]
                        }}
                    />
                </div>
            ) : (
                <div
                    style={{
                        borderStyle: 'solid',
                        backgroundColor: 'rgba(248,248,248,0.5)',
                        borderColor: 'rgba(236,236,236,0.5)',
                        borderRadius: 25,
                        marginTop: 80,
                        width: '50vw',
                        height: '50vh',
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
                <div className='chartRedmineInfo'>
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
                        Общее число задач:{' '}
                        {statistics.reduce((sum, stat) => sum + stat['issues_count'], 0)}
                    </p>
                </div>
            ) : undefined}
        </div>
    )
}
