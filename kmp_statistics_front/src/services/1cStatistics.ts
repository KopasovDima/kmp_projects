import {sendRequest} from '@/services'

export const get1CStatisticsRequest = async (departmentUUID: string) => {
    try {
        return await sendRequest(
            '1c_statistics/' + (departmentUUID ? `?department_uuid=${departmentUUID}` : ''),
            'GET',
        )
    } catch (error) {
        console.error(error)
        return error
    }
}

export const get1CStatisticsByUserRequest = async (userName: string) => {
    try {
        return await sendRequest(`1c_statistics/user/?user_name=${userName}`, 'GET')
    } catch (error) {
        console.error(error)
        return error
    }
}
