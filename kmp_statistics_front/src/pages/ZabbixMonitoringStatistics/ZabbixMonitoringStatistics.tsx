import {FC, useCallback, useEffect, useRef, useState} from 'react'
import {getMonitoringParamsRequest, getMonitoringValuesRequest} from '@/services'
import {Button, Empty, Spin} from 'antd'
import './ZabbixMonitoringStatistics.css'
import 'dayjs/locale/ru'
import {addSecondsToDate} from '@/utils'
import {Gauge, Line} from '@ant-design/plots'
import {UpdateTimer} from '@/components'
import {useSearchParams} from 'react-router'
import alarmSound from '@/assets/alarm.mp3'
import warningSound from '@/assets/warning_alarm.mp3'

// Alarm sounds
// https://free-sound-effects.net/alarm

export const ZabbixMonitoringStatistics: FC = () => {
    const audioRef = useRef<any>(null)
    const [searchParams, _] = useSearchParams()

    const [nextUpdateDate, setNextUpdateDate] = useState<Date | undefined>(undefined)

    const monitoringId = Number.parseInt(searchParams.get('monitoringId') || '0')
    const soundAlarmEnabled = !!(searchParams.get('soundAlarmEnabled') || false)
    const hideHeader = !!(searchParams.get('hideHeader') || false)

    const [lastValue, setLastValue] = useState<number>(0)
    const [warningEnabled, setWarningEnabled] = useState<boolean>(false)
    const [alarmEnabled, setAlarmEnabled] = useState<boolean>(false)

    const [values, setValues] = useState<[]>([])
    const [monitoringParams, setMonitoringParams] = useState<any>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [colors, setColors] = useState<[]>([])
    const [colorBorders, setColorBorders] = useState<[]>([])

    const getColorForValue = useCallback((value: number) => {
        let borderCounter = 0
        while (true) {
            const borderValue = colorBorders?.[borderCounter]
            if (value < borderValue || !borderValue) {
                break
            } else {
                borderCounter++
            }
        }
        return colors[borderCounter] || colors[colors.length - 1]
    }, [monitoringParams, colors, colorBorders])

    const getZabbixMonitoringParams = useCallback(async () => {
        if (monitoringId) {
            setIsLoading(true)
            setMonitoringParams(undefined)
            setValues([])
            const monitoringParamsResponse = await getMonitoringParamsRequest(monitoringId)

            if (monitoringParamsResponse?.zabbix_monitoring?.[0]) {
                setMonitoringParams(monitoringParamsResponse?.zabbix_monitoring?.[0])
            } else console.error('Unable to load monitoring params', monitoringParamsResponse)
        }
    }, [monitoringId])

    useEffect(() => {
        if (monitoringParams) {
            setColors(monitoringParams?.parameter_intervals?.map(
                (colorParam: any) => colorParam.color)?.filter(Boolean)
            )
            setColorBorders(monitoringParams?.parameter_intervals?.slice(1)?.map(
                (colorBorderParam: any) => colorBorderParam.value)?.filter(Boolean)
            )
        }
    }, [monitoringParams])

    const getMonitoringValues = useCallback(async () => {
        if (monitoringParams?.zabbix_item_id && monitoringParams?.update_interval_sec) {
            setNextUpdateDate(addSecondsToDate(new Date(), monitoringParams.update_interval_sec))
            const monitoringValuesResponse = await getMonitoringValuesRequest(monitoringId)
            const responseValues = monitoringValuesResponse?.values || []
            setLastValue(responseValues?.[responseValues?.length - 1]?.value || 0)
            setValues(responseValues)
            setIsLoading(false)
        }
    }, [monitoringParams, monitoringId])

    useEffect(() => {
        if (lastValue < monitoringParams?.parameter_intervals?.[0]?.value) {
            setLastValue(monitoringParams?.parameter_intervals?.[0]?.value)
        }
        if (lastValue > monitoringParams?.parameter_intervals?.[monitoringParams?.parameter_intervals?.length - 1]?.value) {
            setLastValue(monitoringParams?.parameter_intervals?.[monitoringParams?.parameter_intervals?.length - 1]?.value)
        }
    }, [monitoringParams, lastValue])

    useEffect(() => {
        getZabbixMonitoringParams().then().catch()
    }, [monitoringId])

    useEffect(() => {
        getMonitoringValues().then().catch()
    }, [monitoringParams])

    useEffect(() => {
        if (monitoringParams && lastValue) {
            if (lastValue >= monitoringParams.alarm_value) {
                setAlarmEnabled(true)
            } else if (lastValue >= monitoringParams.warning_value) {
                setWarningEnabled(true)
            } else {
                setAlarmEnabled(false)
                setWarningEnabled(false)
            }
        }
    }, [monitoringParams, lastValue])

    useEffect(() => {
        if (!audioRef?.current || !soundAlarmEnabled) return

        if (alarmEnabled || warningEnabled) {
            audioRef.current.loop = true
            audioRef.current.play()
        } else {
            audioRef.current.loop = false
            audioRef.current.pause()
        }
    }, [alarmEnabled, warningEnabled, soundAlarmEnabled, audioRef])

    return (
        <div className={'zabbixMonitoring'}>
            <Button
                type={'primary'}
                onClick={() => setAlarmEnabled(true)}
                style={{
                    position: 'absolute',
                    top: 5,
                    right: 20,
                    width: 80,
                    height: 20,
                }}
            >
                <span style={{fontSize: 10}}>
                    Тест тревоги
                </span>
            </Button>
            <Button
                type={'primary'}
                onClick={() => setWarningEnabled(true)}
                style={{
                    position: 'absolute',
                    top: 5,
                    right: 110,
                    width: 120,
                    height: 20,
                }}
            >
                <span style={{fontSize: 10}}>
                    Тест предупреждения
                </span>
            </Button>
            {alarmEnabled ? (
                <>
                    <div
                        className={'zabbixMonitoringAlarm'}
                        onClick={() => setAlarmEnabled(false)}
                        style={{
                            top: hideHeader ? 0 : -94,
                        }}
                    />
                    {soundAlarmEnabled ? (
                        <audio ref={audioRef} src={alarmSound}/>
                    ) : null}
                </>
            ) : null}
            {warningEnabled ? (
                <>
                    <div
                        className={'zabbixMonitoringWarning'}
                        onClick={() => setWarningEnabled(false)}
                        style={{
                            top: hideHeader ? 0 : -94,
                        }}
                    />
                    {soundAlarmEnabled ? (
                        <audio ref={audioRef} src={warningSound}/>
                    ) : null}
                </>
            ) : null}
            {nextUpdateDate ? (
                <UpdateTimer
                    onUpdate={() => getMonitoringValues().then().catch()}
                    nextUpdateDate={nextUpdateDate}
                />
            ) : null}
            {isLoading && !values?.length ? (
                <div
                    className='zabbixMonitoringChart'
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Spin/>
                </div>
            ) : (
                values?.length > 0 ? (
                    <div className='zabbixMonitoringChart'>
                        <Line
                            title={`Значение показателя "${monitoringParams?.name}"`}
                            data={values}
                            xField={'date'}
                            yField={'value'}
                            style={{
                                gradient: 'y',
                                lineWidth: 2,
                            }}
                            colorField={'value'}
                            shapeField={'smooth'}
                            axis={{
                                x: {
                                    title: 'Время',
                                },
                                y: {
                                    title: monitoringParams?.name,
                                }
                            }}
                            scale={{
                                color: {
                                    type: 'threshold',
                                    domain: colorBorders,
                                    range: colors,
                                },
                            }}
                            legend={false}
                            animate={true}
                            tooltip={{
                                title: (item) => item.date,
                                items: [
                                    (item: any) => {
                                        let valueString = `${item.value?.toFixed(2)}`

                                        return {
                                            name: 'Значение',
                                            value: valueString,
                                            color: getColorForValue(item.value),
                                        }
                                    },
                                ]
                            }}
                        />
                    </div>
                ) : (
                    <div
                        className={'zabbixMonitoringChart'}
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
            )}
            <div
                className='zabbixMonitoringValue'
                style={{
                    height: hideHeader ? 'calc(55vh - 20px)' : 'calc(48vh - 20px)',
                }}
            >
                <Gauge
                    autoFit={true}
                    data={{
                        target: lastValue,
                        total: colorBorders[colorBorders.length - 1],
                        thresholds: colorBorders,
                    }}
                    scale={{
                        color: {
                            range: colors,
                        },
                    }}
                    style={{
                        justifyContent: 'center',
                        textFontSize: 160,
                        pointerStroke: getColorForValue(lastValue),
                        pinStroke: getColorForValue(lastValue),
                        textFill: getColorForValue(lastValue),
                        textY: '75%',
                        arcShape: 'round',
                        textFontFamily: "'KMP_Sirius', Verdana, sans-serif !important;",
                    }}
                />
            </div>
        </div>
    )
}
