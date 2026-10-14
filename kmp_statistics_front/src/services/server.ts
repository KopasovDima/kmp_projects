import {ENV} from '@/consts'

export const sendRequest = async (
    path: string,
    method: string,
    body?: any,
    headers: any = {},
    basePath: string = 'kmp_statistics'
) => {
    const response = await fetch(
        `${ENV.SERVER_URL}/${basePath}/${path}`,
        {
            method,
            body,
            headers,
        }
    )
    const responseJson = await response.json()

    if (response.status !== 200) {
        throw {
            ...responseJson,
            status: response.status,
        }
    }

    return responseJson
}