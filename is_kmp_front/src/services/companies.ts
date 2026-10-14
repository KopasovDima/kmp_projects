import {sendIsKmpRequest} from '@/services'

export const getCompaniesRequest = async () => {
    return await sendIsKmpRequest('companies/', 'GET')
}

export const getAvailableCompaniesRequest = async () => {
    return await sendIsKmpRequest('companies/available/', 'GET')
}

export const getCompanyByIdRequest = async (companyId: number) => {
    return await sendIsKmpRequest(`companies/?company_id=${companyId}`, 'GET')
}
