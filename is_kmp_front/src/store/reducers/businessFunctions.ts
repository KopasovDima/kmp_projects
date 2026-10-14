import {
    ADD_BUSINESS_FUNCTION_REQUEST,
    DELETE_BUSINESS_FUNCTION_REQUEST,
    DETACH_COMPANY_SOFTWARE_FROM_BUSINESS_FUNCTION_REQUEST,
    DOWNLOAD_BUSINESS_FUNCTIONS_REPORT_REQUEST,
    GET_BUSINESS_FUNCTION_DETAILS_REQUEST,
    GET_BUSINESS_FUNCTIONS_REQUEST,
    ON_ADD_BUSINESS_FUNCTION_RESPONSE,
    ON_ATTACHED_COMPANY_SOFTWARE_UPDATED,
    ON_BUSINESS_FUNCTION_DETAILS_RESPONSE,
    ON_BUSINESS_FUNCTIONS_RESPONSE,
    ON_DOWNLOAD_BUSINESS_FUNCTIONS_REPORT_RESPONSE,
    ON_UPDATE_BUSINESS_FUNCTION_RESPONSE,
    UPDATE_BUSINESS_FUNCTION_REQUEST
} from '@/store/actionTypes'

const initialState: {
    businessFunctions: any[]
    isLoading: boolean
    details: any
    detailsIsLoading: boolean
    downloadReportIsLoading: boolean
} = {
    businessFunctions: [],
    isLoading: false,
    details: null,
    detailsIsLoading: false,
    downloadReportIsLoading: false,
}

const updateBusinessFunction = (items: any, businessFunctionId: number | string, params: any) => {
    return items.map((item: any) => {
        let updatedItem = {...item}
        if (updatedItem.id === businessFunctionId) {
            updatedItem = {
                ...updatedItem,
                ...params,
            }
        } else if (item?.children?.length) {
            updatedItem = {
                ...updatedItem,
                children: updateBusinessFunction(item.children, businessFunctionId, params)
            }
        }

        return updatedItem
    })
}

const addBusinessFunction = (items: any, businessFunctionId: number | string, newItem: any) => {
    return items.map((item: any) => {
        let updatedItem = {...item}

        if (updatedItem.id === businessFunctionId) {
            updatedItem.children = [
                ...item?.children,
                newItem,
            ]

        } else if (item?.children?.length) {
            updatedItem = {
                ...updatedItem,
                children: addBusinessFunction(item.children, businessFunctionId, newItem)
            }
        }

        return updatedItem
    })
}

const removeBusinessFunction = (items: any, businessFunctionId: number | string) => {
    return items.map((item: any) => {
        if (item.id === businessFunctionId)
            return null

        let updatedItem = {...item}

        if (item?.children?.length) {
            updatedItem = {
                ...updatedItem,
                children: removeBusinessFunction(item.children, businessFunctionId)
            }
        }

        return updatedItem
    }).filter(item => item)
}

export const businessFunctionsReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case GET_BUSINESS_FUNCTIONS_REQUEST: {
            return {
                ...state,
                isLoading: true,
            }
        }
        case ON_BUSINESS_FUNCTIONS_RESPONSE: {
            return {
                ...state,
                businessFunctions: action.businessFunctions,
                isLoading: false,
            }
        }
        case UPDATE_BUSINESS_FUNCTION_REQUEST:
            return {
                ...state,
                businessFunctions: updateBusinessFunction(state.businessFunctions, action.businessFunctionId, {name: action.name}),
            }
        case ON_UPDATE_BUSINESS_FUNCTION_RESPONSE:
            return {
                ...state,
                businessFunctions: updateBusinessFunction(state.businessFunctions, action.updatedBusinessFunction.id, action.updatedBusinessFunction),
            }
        case ADD_BUSINESS_FUNCTION_REQUEST:
            return {
                ...state,
                businessFunctions: addBusinessFunction(state.businessFunctions, action.parentId, {
                    id: 'new',
                    name: action.name,
                    children: [],
                }),
            }
        case ON_ADD_BUSINESS_FUNCTION_RESPONSE:
            return {
                ...state,
                businessFunctions: updateBusinessFunction(state.businessFunctions, 'new', action.createdBusinessFunction),
            }
        case DELETE_BUSINESS_FUNCTION_REQUEST:
            return {
                ...state,
                businessFunctions: removeBusinessFunction(state.businessFunctions, action.businessFunctionId),
            }
        case GET_BUSINESS_FUNCTION_DETAILS_REQUEST:
            return {
                ...state,
                details: action.clearOldDetails ? null : state.details,
                detailsIsLoading: true,
            }
        case ON_BUSINESS_FUNCTION_DETAILS_RESPONSE:
            return {
                ...state,
                details: {
                    ...state.details,
                    ...action.businessFunctionByCompany,
                    createdSoftwareId: action.businessFunctionByCompany.createdSoftwareId || null,
                },
                detailsIsLoading: false,
            }
        case DETACH_COMPANY_SOFTWARE_FROM_BUSINESS_FUNCTION_REQUEST:
            return {
                ...state,
                details: {
                    ...state.details,
                    company_software: state.details.company_software?.filter((cs) => cs.id !== action.companySoftwareId),
                },
            }
        case ON_ATTACHED_COMPANY_SOFTWARE_UPDATED:
            return {
                ...state,
                details: {
                    ...state.details,
                    company_software: action.companySoftware,
                },
            }
        case DOWNLOAD_BUSINESS_FUNCTIONS_REPORT_REQUEST:
        case ON_DOWNLOAD_BUSINESS_FUNCTIONS_REPORT_RESPONSE:
            return {
                ...state,
                downloadReportIsLoading: action.type === DOWNLOAD_BUSINESS_FUNCTIONS_REPORT_REQUEST,
            }
        default:
            return {...state}
    }
}