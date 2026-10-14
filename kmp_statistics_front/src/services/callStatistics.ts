import {sendRequest} from '@/services'

export const getCallStatisticsPeriodsRequest = async () => {
    try {
        return await sendRequest(
            `call_statistics/periods/`,
            'GET',
        )
    } catch (error) {
        console.error(error)
        return error
    }
}

export const getCallStatisticsRequest = async (
    month: number,
    year: number,
    includeMissingCalls: boolean,
    callType: string,
    departmentId?: number | string,
) => {
    try {
        return await sendRequest(
            `call_statistics/?month=${month}&year=${year}&` +
            `include_missing_calls=${includeMissingCalls}` +
            `${callType ? '&call_type=' + callType : ''}` +
            `${departmentId ? '&department_id=' + departmentId : ''}`,
            'GET',
        )
    } catch (error) {
        console.error(error)
        return error
    }
}

export const getCallStatisticsByUserRequest = async (
    month: number,
    year: number,
    user_phone_number: number,
    includeMissingCalls: boolean,
    callType: string,
) => {
    try {
        return sendRequest(
            `call_statistics/user/?month=${month}&year=${year}&user_phone_number=${user_phone_number}&` +
            `include_missing_calls=${includeMissingCalls}` +
            `${callType ? '&call_type=' + callType : ''}`,
            'GET',
        )
    } catch (error) {
        console.error(error)
        return error
    }
}