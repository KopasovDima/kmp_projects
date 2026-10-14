import {sendRequest} from '@/services'

export const getHostsRequest = async () => {
    try {
        return await sendRequest('zabbix_statistics/hosts/', 'GET')
    } catch (error) {
        console.error(error)
        return error
    }
}

export const getHostItemsRequest = async (hostId: number) => {
    try {
        return await sendRequest(`zabbix_statistics/hosts/${hostId}/items/`, 'GET')
    } catch (error) {
        console.error(error)
        return error
    }
}

export const getHistoryStatisticsRequest = async (itemId: number, valueType: string, startDate: string, endDateString: string) => {
    try {
        return await sendRequest(
            `zabbix_statistics/history/?itemid=${itemId}&start_date=${startDate}&end_date=${endDateString}&value_type=${valueType}`,
            'GET',
        )
    } catch (error) {
        console.error(error)
        return error
    }
}

export const getMonitoringParamsRequest = async (monitoringId: number) => {
    try {
        return await sendRequest(
            `zabbix_statistics/monitoring_params/?zabbix_monitoring_id=${monitoringId}`,
            'GET',
        )
    } catch (error) {
        console.error(error)
        return error
    }
}

export const getMonitoringValuesRequest = async (monitoringId: number) => {
    try {
        return await sendRequest(`zabbix_statistics/monitoring_params/${monitoringId}/values/`, 'GET')
    } catch (error) {
        console.error(error)
        return error
    }
}
