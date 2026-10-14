import {sendRequest} from '@/services'

export const getUsersRequest = async () => {
    try {
        return await sendRequest(`users/`, 'GET')
    } catch (error) {
        console.error(error)
        return error
    }
}

export const get1CUsersRequest = async () => {
    try {
        return await sendRequest('users/1c_users/', 'GET')
    } catch (error) {
        console.error(error)
        return error
    }
}

