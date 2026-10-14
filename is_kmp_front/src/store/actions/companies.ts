import {
    GET_AVAILABLE_COMPANIES_REQUEST,
    GET_COMPANY_BY_ID_REQUEST,
    ON_AVAILABLE_COMPANIES_RESPONSE,
    ON_COMPANY_BY_ID_RESPONSE,
} from '@/store/actionTypes'

export const getAvailableCompaniesAction = () => ({
    type: GET_AVAILABLE_COMPANIES_REQUEST,
})

export const onAvailableCompaniesResponseAction = (companies: any[]) => ({
    type: ON_AVAILABLE_COMPANIES_RESPONSE,
    companies,
})

export const getCompanyByIdAction = (companyId) => ({
    type: GET_COMPANY_BY_ID_REQUEST,
    companyId,
})

export const onCompanyByIdResponseAction = (companyId, company) => ({
    type: ON_COMPANY_BY_ID_RESPONSE,
    companyId,
    company,
})
