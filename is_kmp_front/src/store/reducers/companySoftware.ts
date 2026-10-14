import {
    GET_COMPANY_SOFTWARE_BY_CLASSES_REQUEST,
    GET_COMPANY_SOFTWARE_REQUEST,
    ON_ADD_COMPANY_SOFTWARE_RESPONSE,
    ON_COMPANY_SOFTWARE_BY_CLASSES_RESPONSE,
    ON_COMPANY_SOFTWARE_RESPONSE,
    ON_DELETE_COMPANY_SOFTWARE_RESPONSE,
    ON_IMPLEMENTATION_STATUSES_RESPONSE,
    ON_SOFTWARE_CLASSES_RESPONSE,
    ON_SOFTWARE_RESPONSE,
    ON_SOFTWARE_TAGS_RESPONSE,
    ON_UPDATE_COMPANY_SOFTWARE_RESPONSE,
    ON_UPDATE_SOFTWARE_RESPONSE,
    SOFTWARE_VERSIONS_UPDATED_REQUEST,
} from '@/store/actionTypes'

const initialState = {
    companySoftware: {
        data: [],
        isLoading: false,
    },
    companySoftwareByClasses: {
        data: [],
        isLoading: false,
    },
    softwareClasses: [],
    softwareTags: [],
    software: [],
    implementationStatuses: [],
}

export const companySoftwareReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case GET_COMPANY_SOFTWARE_REQUEST: {
            return {
                ...state,
                companySoftware: {
                    ...state.companySoftware,
                    isLoading: true,
                }
            }
        }
        case ON_COMPANY_SOFTWARE_RESPONSE: {
            return {
                ...state,
                companySoftware: {
                    data: action.companySoftware,
                    isLoading: false,
                }
            }
        }
        case GET_COMPANY_SOFTWARE_BY_CLASSES_REQUEST: {
            return {
                ...state,
                companySoftwareByClasses: {
                    ...state.companySoftwareByClasses,
                    isLoading: true,
                }
            }
        }
        case ON_COMPANY_SOFTWARE_BY_CLASSES_RESPONSE: {
            return {
                ...state,
                companySoftwareByClasses: {
                    data: action.companySoftware,
                    isLoading: false,
                }
            }
        }
        case ON_SOFTWARE_CLASSES_RESPONSE: {
            return {
                ...state,
                softwareClasses: action.softwareClasses,
            }
        }
        case ON_SOFTWARE_TAGS_RESPONSE: {
            return {
                ...state,
                softwareTags: action.softwareTags,
            }
        }
        case ON_SOFTWARE_RESPONSE: {
            return {
                ...state,
                software: action.software,
            }
        }
        case ON_ADD_COMPANY_SOFTWARE_RESPONSE: {
            const newCompanySoftwareData: any[] = [...state.companySoftware.data]

            if (action.newCompanySoftware)
                newCompanySoftwareData.push(action.newCompanySoftware)

            return {
                ...state,
                companySoftware: {
                    ...state.companySoftware,
                    data: newCompanySoftwareData,
                },
            }
        }
        case ON_UPDATE_COMPANY_SOFTWARE_RESPONSE: {
            let newCompanySoftwareData: any[] = [...state.companySoftware.data]

            if (action.updatedCompanySoftware)
                newCompanySoftwareData = newCompanySoftwareData.map((cs) => {
                    if (cs.id === action.updatedCompanySoftware.id)
                        return {
                            ...action.updatedCompanySoftware,
                        }
                    return cs
                })

            return {
                ...state,
                companySoftware: {
                    ...state.companySoftware,
                    data: newCompanySoftwareData,
                },
            }
        }
        case ON_DELETE_COMPANY_SOFTWARE_RESPONSE: {
            return {
                ...state,
                companySoftware: {
                    ...state.companySoftware,
                    data: state.companySoftware?.data?.filter((cs: any) => cs.id !== action.companySoftwareId)
                },
            }
        }
        case ON_IMPLEMENTATION_STATUSES_RESPONSE:
            return {
                ...state,
                implementationStatuses: action.implementationStatuses,
            }
        case SOFTWARE_VERSIONS_UPDATED_REQUEST:
            return {
                ...state,
                software: state.software?.map((s: any) => {
                    if (s?.id === action.softwareId)
                        return {
                            ...s,
                            versions: action.versions,
                        }
                    return s
                }),
            }
        case ON_UPDATE_SOFTWARE_RESPONSE:
            return {
                ...state,
                companySoftware: {
                    ...state.companySoftware,
                    data: state.companySoftware?.data?.map(
                        (cs: any) => cs.software.id === action.updatedSoftware?.id ? (
                            {
                                ...cs,
                                software: action.updatedSoftware,
                            }
                        ) : cs
                    )
                },
                software: state.software?.map(
                    (s: any) => s?.id === action.updatedSoftware?.id ? {...action.updatedSoftware} : s
                ),
            }
        default:
            return {...state}
    }
}