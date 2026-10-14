import {
    GET_AVAILABLE_COMPANIES_REQUEST,
    GET_COMPANY_BY_ID_REQUEST,
    ON_AVAILABLE_COMPANIES_RESPONSE,
    ON_COMPANY_BY_ID_RESPONSE,
} from '@/store/actionTypes'

const initialState = {
    availableCompanies: undefined,
    isLoading: false,
    companiesInfo: {},
}

export const companiesReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case GET_AVAILABLE_COMPANIES_REQUEST: {
            return {
                ...state,
                isLoading: true,
            }
        }
        case ON_AVAILABLE_COMPANIES_RESPONSE: {
            return {
                ...state,
                availableCompanies: action.companies,
                isLoading: false,
            }
        }
        case GET_COMPANY_BY_ID_REQUEST: {
            return {
                ...state,
                companiesInfo: {
                    ...state.companiesInfo,
                    [action.companyId]: {
                        ...state.companiesInfo[action.companyId],
                        isLoading: true,
                    }
                }
            }
        }
        case ON_COMPANY_BY_ID_RESPONSE: {
            return {
                ...state,
                companiesInfo: {
                    ...state.companiesInfo,
                    [action.companyId]: {
                        ...action.company,
                        isLoading: false,
                    }
                }
            }
        }
        default:
            return {...state}
    }
}