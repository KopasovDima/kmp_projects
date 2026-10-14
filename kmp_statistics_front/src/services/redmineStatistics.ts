import {sendRequest} from '@/services'

export const getPeriodsRequest = async () => {
    try {
        return await sendRequest(
            'redmine_statistics/periods/',
            'GET',
        )
    } catch (error) {
        console.error(error)
        return error
    }
}

export const getRedminePersonsRequest = async () => {
    try {
        return await sendRequest(
            `redmine_statistics/persons/`,
            'GET',
        )
    } catch (error) {
        console.error(error)
        return error
    }
}

export const getRedmineStatisticsRequest = async (year?: string, month?: string, personType?: string, personName?: string, issueStatus?: string) => {
    try {
        let url = 'redmine_statistics/?'

        if (year) url += `year=${year}&`
        if (month) url += `month=${month}&`
        if (personType) url += `person_type=${personType}&`
        if (personName) url += `person_name=${personName}&`
        if (issueStatus) url += `issue_status=${issueStatus}`

        if (url.endsWith('?')) url = url.slice(0, url.length - 1)
        if (url.endsWith('&')) url = url.slice(0, url.length - 1)

        return await sendRequest(url, 'GET')
    } catch (error) {
        console.error(error)
        return error
    }
}

export const getRedmineCommonStatisticsRequest = async (year: string | number) => {
    try {
        return await sendRequest(`redmine_statistics/common/?year=${year}`, 'GET')
    } catch (error) {
        console.error(error)
        return error
    }
}
