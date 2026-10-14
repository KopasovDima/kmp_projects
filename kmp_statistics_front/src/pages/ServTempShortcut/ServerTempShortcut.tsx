import {FC} from 'react'

export const ServerTempShortcut: FC = () => {
    window.location.replace('/zabbix-monitoring/?monitoringId=1&soundAlarmEnabled=true&hideHeader=true')
    return null
}
