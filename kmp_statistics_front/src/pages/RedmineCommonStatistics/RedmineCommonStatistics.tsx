import {FC, useCallback, useEffect, useState} from 'react'
import {Button, Empty, Flex, Select, Typography} from 'antd'
import {useNavigate} from 'react-router'
import {getRedmineCommonStatisticsRequest} from '@/services'
import './RedmineCommonStatistics.css'
import {Column} from '@ant-design/plots'
import {UpdateTimer} from '@/components'
import {addSecondsToDate} from '@/utils'
import {UPDATE_TIME_15_MIN} from '@/consts'

const {Paragraph} = Typography

const startYear = 2023
const currentYear = new Date().getFullYear()
const years = [...Array(currentYear - startYear + 1).keys()].map(i => startYear + i).reverse()

export const RedmineCommonStatistics: FC = () => {
    const [nextUpdateDate, setNextUpdateDate] = useState<Date>(addSecondsToDate(new Date(), UPDATE_TIME_15_MIN))

    const navigate = useNavigate()

    const [statistics, setStatistics] = useState<any>(undefined)

    const [selectedYear, setSelectedYear] = useState<any>(currentYear)

    const getRedmineCommonStatistics = useCallback(async () => {
        const statisticsResponse = await getRedmineCommonStatisticsRequest(selectedYear)
        setStatistics(statisticsResponse)
        setNextUpdateDate(addSecondsToDate(new Date(), UPDATE_TIME_15_MIN))
    }, [selectedYear])

    useEffect(() => {
        getRedmineCommonStatistics().then().catch()
    }, [selectedYear])

    const noData = (title: string, leftPosition: number | string) => (
        <div
            className={'noDataRedmineCommon'}
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
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                marginTop: 20,
            }}
        >
            <UpdateTimer
                onUpdate={() => getRedmineCommonStatistics().then().catch()}
                nextUpdateDate={nextUpdateDate}
            />
            <Flex
                vertical={true}
                align={'center'}
            >
                <Paragraph>Просмотр статистики ДИТ (Redmine)</Paragraph>
                <div
                    style={{
                        marginTop: 20,
                    }}
                >
                    {statistics ? (
                        <>
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
                            <Button
                                type={'link'}
                                onClick={() => navigate('/redmine/')}
                                style={{
                                    width: 100,
                                    height: 40,
                                }}
                            >
                                Подробнее
                            </Button>
                            <Flex
                                vertical={false}
                                justify={'space-evenly'}
                            >
                                {statistics['redmine_statistics']?.length > 0 ? (
                                    <div
                                        className='chartRedmineCommon'
                                        style={{
                                            left: '1%',
                                        }}
                                    >
                                        <Column
                                            title={'Задачи ДИТ (Redmine)'}
                                            data={statistics['redmine_statistics']}
                                            xField={'month_name'}
                                            yField={'value'}
                                            style={{
                                                fill: 'rgb(228,171,82)',
                                                radiusTopLeft: 5,
                                                radiusTopRight: 5,
                                                align: 'center',
                                            }}
                                            tooltip={{
                                                title: () => 'Количество задач в Redmine',
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
                                ) : noData('Задачи ДИТ (Redmine)', '1%')}
                            </Flex>
                        </>
                    ) : undefined}
                </div>
            </Flex>
        </div>
    )
}
