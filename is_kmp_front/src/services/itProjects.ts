import {sendIsKmpRequest} from '@/services'

export const getITProjectsRequest = async () => {
    return await sendIsKmpRequest('it_projects/', 'GET', null, {UseChildCompanyId: true})
}

export const createITProjectRequest = async (
    name: string,
    description: string,
    purpose: string,
    initiator: string,
    leader: string,
    budget: string,
    startDate: string,
    endDate: string,
) => {
    return await sendIsKmpRequest(
        'it_projects/create/',
        'POST',
        {
            name,
            description,
            purpose,
            initiator,
            leader,
            budget,
            start_date: startDate,
            end_date: endDate,
        },
        {UseChildCompanyId: true},
    )
}

export const updateITProjectRequest = async (
    itProjectId: number,
    name: string,
    description: string,
    purpose: string,
    initiator: string,
    leader: string,
    budget: string,
    startDate: string,
    endDate: string,
) => {
    return await sendIsKmpRequest(
        `it_projects/${itProjectId}/update/`,
        'PUT',
        {
            name,
            description,
            purpose,
            initiator,
            leader,
            budget,
            start_date: startDate,
            end_date: endDate,
        },
        {UseChildCompanyId: true},
    )
}

export const deleteITProjectRequest = async (itProjectId: number) => {
    return await sendIsKmpRequest(
        `it_projects/${itProjectId}/delete/`,
        'DELETE',
        null,
        {UseChildCompanyId: true},
    )
}
