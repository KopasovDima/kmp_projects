import {sendRequest} from '@/services'

export const getDepartmentsRequest = async () => {
    try {
        return await sendRequest(`departments/`, 'GET')
    } catch (error) {
        console.error(error)
        return error
    }
}
