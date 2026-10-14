import {FC, useCallback, useEffect, useRef, useState} from 'react'
import {Button, Empty, Flex, Select, Typography} from 'antd'
import {useNavigate} from 'react-router'
import {getCommonStatisticsRequest, getDepartmentsRequest} from '@/services'
import './Home.css'
import {Column} from '@ant-design/plots'
import {UpdateTimer} from '@/components'
import {addSecondsToDate} from '@/utils'
import {UPDATE_TIME_15_MIN} from '@/consts'

const {Paragraph} = Typography

const startYear = 2023
const currentYear = new Date().getFullYear()
const years = [...Array(currentYear - startYear + 1).keys()].map(i => startYear + i).reverse()

export const Home: FC = () => {
    const [nextUpdateDate, setNextUpdateDate] = useState<Date>(addSecondsToDate(new Date(), UPDATE_TIME_15_MIN))

    const navigate = useNavigate()

    const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>('Общая статистика')
    const [departments, setDepartments] = useState<[]>([])

    const [statistics, setStatistics] = useState<any>(undefined)

    const [selectedYear, setSelectedYear] = useState<any>(currentYear)

    const getCommonStatistics = useCallback(async () => {
        const statisticsResponse = await getCommonStatisticsRequest(
            selectedYear,
            selectedDepartment === 'Общая статистика' ? '' : selectedDepartment,
            selectedDepartment === 'Общая статистика' ? 0 : (
                (departments.find((department) => department['1c_uuid'] === selectedDepartment) as any)?.sprav_id || -1
            )
        )
        setStatistics(statisticsResponse)
        setNextUpdateDate(addSecondsToDate(new Date(), UPDATE_TIME_15_MIN))
    }, [selectedYear, selectedDepartment])

    const departmentSelectRef = useRef<any>(null)

    const getDepartments = useCallback(async () => {
        const departmentsResponse = await getDepartmentsRequest()
        setDepartments(departmentsResponse.departments)
    }, [])

    useEffect(() => {
        getDepartments().then().catch()
    }, [])

    useEffect(() => {
        getCommonStatistics().then().catch()
    }, [selectedYear, selectedDepartment])

    const noData = (title: string, leftPosition: number | string) => (
        <div
            className={'noData'}
            style={{
                left: leftPosition
            }}
        >
            <h3>{title}</h3>
            <Empty description={'Нет данных'}/>
        </div>
    )

    return (
        <div
            style={{
                height: '100%',
                justifyContent: 'center',
                justifySelf: 'center',
                padding: '2rem',
                alignItems: 'center',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                marginTop: 20,
            }}
        >
            <UpdateTimer
                onUpdate={() => getCommonStatistics().then().catch()}
                nextUpdateDate={nextUpdateDate}
            />
            <Flex
                vertical={true}
                align={'center'}
            >
                <Paragraph>Просмотр статистики</Paragraph>
                <Flex
                    vertical={false}
                    justify={'space-around'}
                    style={{
                        width: 820,
                    }}
                >
                    <Button
                        type={'primary'}
                        onClick={() => navigate('/1c/')}
                        style={{
                            width: 150,
                            height: 30,
                        }}
                    >
                        Задачи в 1С:ДО
                    </Button>
                    <Button
                        type={'primary'}
                        onClick={() => navigate('/calls/')}
                        style={{
                            width: 80,
                            height: 30,
                        }}
                    >
                        Звонки
                    </Button>
                    <Button
                        type={'primary'}
                        onClick={() => navigate('/redmine_common/')}
                        style={{
                            width: 220,
                            height: 30,
                        }}
                    >
                        Задачи ДИТ (Redmine)
                    </Button>
                    <Button
                        type={'primary'}
                        onClick={() => navigate('/zabbix/')}
                        style={{
                            width: 80,
                            height: 30,
                        }}
                    >
                        Zabbix
                    </Button>
                    <Button
                        type={'primary'}
                        onClick={() => {
                            navigate('/zabbix-monitoring/?monitoringId=1&soundAlarmEnabled=true&hideHeader=true')
                        }}
                        style={{
                            width: 170,
                            height: 30,
                        }}
                    >
                        <div style={{fontSize: 12}}>
                            Мониторинг<br/>
                            температуры в серверной
                        </div>
                    </Button>
                </Flex>
                <div
                    style={{
                        marginTop: 20,
                    }}
                >
                    {statistics ? (
                        <>
                            <Flex
                                vertical={false}
                                justify="center"
                                style={{
                                    height: 50,
                                    alignItems: 'center',
                                }}
                            >
                                <Paragraph>
                                    Общая статистика за
                                    <Select
                                        style={{
                                            marginLeft: 10,
                                            marginRight: 10,
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
                                        options={years.map((year) => ({
                                            value: year,
                                            label: year,
                                        }))}
                                        onChange={(year) => setSelectedYear(year)}
                                    />
                                    год
                                </Paragraph>
                                <Flex
                                    vertical={false}
                                    justify="center"
                                    style={{
                                        marginLeft: 20,
                                    }}
                                >
                                    <Paragraph>Выбор департамента:</Paragraph>
                                    <Select
                                        ref={departmentSelectRef}
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
                                        value={selectedDepartment}
                                        onChange={(department1CUUID) => setSelectedDepartment(department1CUUID)}
                                        options={[
                                            ...departments.map((department: any) => ({
                                                label: department.name,
                                                value: department['1c_uuid'],
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
                            <Flex
                                vertical={false}
                                justify={'space-evenly'}
                            >
                                {statistics['1c_statistics']?.length > 0 ? (
                                    <div
                                        className='chartCommon'
                                        style={{
                                            left: '1%',
                                        }}
                                    >
                                        <Column
                                            title={'Задачи в 1С:ДО + ДИТ (Redmine)'}
                                            data={statistics['1c_statistics']}
                                            xField={'month_name'}
                                            yField={'value'}
                                            style={{
                                                fill: 'rgba(61,149,68,0.8)',
                                                radiusTopLeft: 5,
                                                radiusTopRight: 5,
                                                align: 'center',
                                            }}
                                            tooltip={{
                                                title: () => 'Количество подзадач в 1С + ДИТ (Redmine)',
                                                items: [
                                                    (item: any) => {
                                                        return {
                                                            name: item.month_name,
                                                            value: item.value,
                                                        }
                                                    },
                                                ]
                                            }}
                                        />
                                    </div>
                                ) : noData('Задачи в 1С:ДО + ДИТ (Redmine)', '1%')}
                                {statistics['call_statistics']?.length > 0 ? (
                                    <div
                                        className='chartCommon'
                                        style={{
                                            left: '51%',
                                        }}
                                    >
                                        <Column
                                            title={'Звонки'}
                                            data={statistics['call_statistics']}
                                            xField={'month_name'}
                                            yField={'value'}
                                            style={{
                                                fill: '#3c7ba8',
                                                radiusTopLeft: 5,
                                                radiusTopRight: 5,
                                                align: 'center',
                                            }}
                                            tooltip={{
                                                title: () => 'Количество звонков',
                                                items: [
                                                    (item: any) => {
                                                        return {
                                                            name: item.month_name,
                                                            value: item.value,
                                                        }
                                                    },
                                                ]
                                            }}
                                        />
                                    </div>
                                ) : noData('Звонки', '51%')}
                            </Flex>
                        </>
                    ) : undefined}
                </div>
            </Flex>
        </div>
    )
}
