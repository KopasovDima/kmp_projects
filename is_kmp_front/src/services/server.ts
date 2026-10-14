import {ENV} from '@/consts'
import {getAuthToken} from '@/utils'
import secureLocalStorage from 'react-secure-storage'

export const sendAuthRequest = async (
    path: string,
    method: string,
    body?: any,
    headers?: any,
) => {
    return await sendRequest(
        path,
        method,
        body,
        headers,
        'auth',
        ENV.AUTH_SERVER_URL,
    )
}

export const sendIsKmpRequest = async (
    path: string,
    method: string,
    body?: any,
    headers?: any,
) => {
    return await sendRequest(
        path,
        method,
        body,
        headers,
        'is_kmp',
        ENV.SERVER_URL,
    )
}

export const sendRequest = async (
    path: string,
    method: string,
    body?: any,
    headers?: any,
    basePath: string = 'is_kmp',
    serverUrl: string = '',
) => {
    if (!serverUrl) {
        console.error('SERVER NOT SPECIFIED')
        return
    }

    let formData

    if (body) {
        formData = new FormData()
        for (const key in body) {
            let isFile = false
            let valueStr = body[key]

            if (typeof valueStr === 'object' && valueStr.file && valueStr.file.name) {
                valueStr = valueStr.file.name
                isFile = true
            } else {
                valueStr = valueStr?.toString()
            }


            if (isFile) formData.append(valueStr, body[key].file, valueStr)
            else formData.append(key, valueStr)
        }
    }

    const authToken = getAuthToken()

    if (!headers) headers = {}

    if (authToken && !('Authorization' in headers)) {
        headers['Authorization'] = 'Bearer ' + authToken
    }

    if (headers['UseChildCompanyId']) {
        if ((secureLocalStorage.getItem('userSelectedChildCompany') as any)?.id) {
            headers['UseChildCompanyId'] = (secureLocalStorage.getItem('userSelectedChildCompany') as any)?.id
        } else {
            delete headers['UseChildCompanyId']
        }
    }

    const response = await fetch(
        `${serverUrl}/${basePath}/${path}`,
        {
            method,
            body: formData,
            headers,
        }
    )

    if (response.headers.get('Content-Type') !== 'application/json') {
        return response
    }

    const responseJson = await response.json()

    if (response.status !== 200) {
        throw {
            ...responseJson,
            status: response.status,
        }
    }

    return responseJson
}