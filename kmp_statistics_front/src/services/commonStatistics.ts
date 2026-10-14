import {sendRequest} from '@/services'


export const getCommonStatisticsRequest = async (
    year: string | number,
    departmentUUID?: string,
    departmentId?: number,
) => {
    try {
        return await sendRequest(
            `common_statistics/?include_redmine=true&year=${year}` +
            `${departmentUUID ? `&department_uuid=${departmentUUID}` : ''}` +
            `${departmentId ? `&department_id=${departmentId}` : ''}`,
            'GET',
        )
    } catch (error) {
        console.error(error)
        return error
    }
}
