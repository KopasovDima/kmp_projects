import {FC, useEffect} from 'react'
import {Flex, Spin, Switch, Typography} from 'antd'
import {useDispatch, useSelector} from 'react-redux'
import {getNotificationsSettingsAction, setNotificationSettingNewValueAction} from '@/store/actions'
import './Settings.css'
import {getNotificationsSettingsSelector} from '@/store/selectors'
import {Tooltip} from '@/components'

const {Paragraph, Title} = Typography

export const Settings: FC = () => {
    const dispatch = useDispatch()

    const {notificationsSettings} = useSelector(getNotificationsSettingsSelector)

    useEffect(() => {
        window.document.title = 'Настройки'

        dispatch(getNotificationsSettingsAction())
    }, [])

    return (
        <Flex className={'settings'} vertical>
            <Title level={4}>Настройки уведомлений</Title>
            {notificationsSettings?.length ? (
                notificationsSettings.map((notificationSetting) => (
                    <Tooltip
                        key={notificationSetting.id}
                        value={(
                            <Flex
                                vertical={false}
                                justify={'space-between'}
                                className={'settingsNotificationRow'}
                            >
                                <Paragraph className={'settingsNotificationName'}>{notificationSetting.name}</Paragraph>
                                <Switch
                                    className={'settingsNotificationSwitch'}
                                    loading={notificationSetting.isLoading}
                                    value={notificationSetting.value}
                                    size={'small'}
                                    onChange={(newValue) => dispatch(setNotificationSettingNewValueAction(notificationSetting.id, newValue))}
                                />
                            </Flex>
                        )}
                        title={notificationSetting.description}
                    />
                ))
            ) : (
                <div className={'settingsSpinContainer'}><Spin/></div>
            )}
        </Flex>
    )
}