import {FC, useCallback, useEffect, useRef, useState} from 'react'
import {
    get1CStatisticsByUserRequest,
    get1CStatisticsRequest,
    get1CUsersRequest,
    getDepartmentsRequest
} from '@/services'
import {Empty, Flex, Select, Typography} from 'antd'
import {Line} from '@ant-design/plots'
import './1CStatistics.css'
import {UpdateTimer} from '@/components'
import {addSecondsToDate} from '@/utils'
import {UPDATE_TIME_15_MIN} from '@/consts'

const {Paragraph} = Typography


const formatStatisticsParameter = (parameter: string) => {
    if (parameter === 'КоличествоВходящихДокументов') return 'Входящие документы'
    if (parameter === 'КоличествоИсходящихДокументов') return 'Исходящие документы'
    if (parameter === 'КоличествоВнутреннихДокументов') return 'Внутренние документы'
    if (parameter === 'КоличествоЗакупок') return 'Закупки'
    if (parameter === 'КоличествоПодзадачПоДепартаментам' || parameter === 'КоличествоПодзадачПоИсполнителям')
        return 'Подзадачи'
    return parameter
}

export const Statistics1C: FC = () => {
    const [nextUpdateDate, setNextUpdateDate] = useState<Date>(addSecondsToDate(new Date(), UPDATE_TIME_15_MIN))

    const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>()
    const [departments, setDepartments] = useState<[]>([])
    const [statistics, setStatistics] = useState<[]>([])

    const [selectedUser, setSelectedUser] = useState<string | undefined>()
    const [users, setUsers] = useState<[]>([])

    const departmentSelectRef = useRef<any>(null)
    const userSelectRef = useRef<any>(null)

    const getDepartments = useCallback(async () => {
        const departmentsResponse = await getDepartmentsRequest()
        if (departmentsResponse.departments?.length > 0) {
            setDepartments(departmentsResponse.departments)
            setSelectedDepartment('Общая статистика')
        }
    }, [])

    const getUsers = useCallback(async () => {
        const usersResponse = await get1CUsersRequest()

        if (usersResponse.users?.length > 0) {
            setUsers(usersResponse.users)
            setSelectedUser('Общая статистика')
        }
    }, [])

    const getStatistics = useCallback(async () => {
        const statisticsResponse = selectedUser !== 'Общая статистика' ?
            await get1CStatisticsByUserRequest(selectedUser || '') :
            await get1CStatisticsRequest((selectedDepartment === 'Общая статистика' ? '' : selectedDepartment) || '')

        setStatistics(statisticsResponse.statistics.map((stat: any) => ({
            ...stat,
            parameter: formatStatisticsParameter(stat.parameter),
        })))
        setNextUpdateDate(addSecondsToDate(new Date(), UPDATE_TIME_15_MIN))
    }, [selectedDepartment, selectedUser])

    useEffect(() => {
        getDepartments().then().catch()
        getUsers().then().catch()
    }, [])

    useEffect(() => {
        if (selectedDepartment) {
            getStatistics().then().catch()
        }
    }, [selectedDepartment, selectedUser])

    if (!selectedDepartment && !selectedUser) return

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
                    style={{
                        alignItems: 'center',
                        display: 'flex',
                    }}
                >
                    <Paragraph>Департамент</Paragraph>
                    <Select
                        ref={departmentSelectRef}
                        style={{
                            paddingLeft: 20,
                            width: 600,
                            textAlign: 'center',
                        }}
                        styles={{
                            popup: {
                                root: {
                                    textAlign: 'center'
                                },
                            },
                        }}
                        value={selectedDepartment}
                        onChange={(department1CUUID) => setSelectedDepartment(department1CUUID)}
                        options={[
                            ...departments.map((department: any) => ({
                                label: department.name,
                                value: department['1c_uuid'],
                            })),
                        ]}
                        disabled={selectedUser !== 'Общая статистика'}
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
                <Flex
                    vertical
                    justify="center"
                    style={{
                        alignItems: 'center',
                        display: 'flex',
                    }}
                >
                    <Paragraph>Пользователь</Paragraph>
                    <Select
                        ref={userSelectRef}
                        style={{
                            paddingLeft: 20,
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
                        disabled={selectedDepartment !== 'Общая статистика'}
                        value={selectedUser}
                        onChange={(user) => setSelectedUser(user)}
                        options={[
                            ...users.map((user: any) => ({
                                label: user.name,
                                value: user.name,
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
                                        userSelectRef.current.blur()
                                        setSelectedUser('Общая статистика')
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
            {statistics?.length > 0 ? (
                <div className='chart1C'>
                    <Line
                        title={'Статистика 1С:ДО'}
                        data={statistics}
                        xField={'time'}
                        yField={'value'}
                        colorField={'parameter'}
                        style={{
                            lineWidth: 6,
                        }}
                        scale={{
                            color: {
                                range: selectedUser === 'Общая статистика' ? [
                                    'rgba(243,81,81,0.8)', // КоличествоВходящихДокументов
                                    'rgba(98,137,209,0.8)', // КоличествоИсходящихДокументов
                                    'rgb(198,173,137)', // КоличествоВнутреннихДокументов
                                    'rgba(253,218,123,0.8)', // КоличествоЗакупок
                                    'rgba(61,149,68,0.8)', // КоличествоПодзадачПоДепартаментам
                                ] : [
                                    'rgba(61,149,68,0.8)', // КоличествоПодзадачПоДепартаментам
                                ]
                            }
                        }}
                        legend={{
                            color: {
                                itemMarkerSize: 80,
                            },
                        }}
                    />
                </div>
            ) : (
                <div
                    className={'chart1C'}
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
        </div>
    )
}
