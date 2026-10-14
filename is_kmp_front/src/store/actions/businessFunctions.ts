import {
    ADD_BUSINESS_FUNCTION_REQUEST,
    ATTACH_COMPANY_SOFTWARE_TO_BUSINESS_FUNCTION_REQUEST,
    ATTACH_NEW_COMPANY_SOFTWARE_TO_BUSINESS_FUNCTION_REQUEST,
    CHANGE_BUSINESS_FUNCTION_ORDER,
    CREATE_AND_ADD_TARGET_SOFTWARE_TO_BUSINESS_FUNCTION_REQUEST,
    CREATE_AND_ATTACH_NEW_COMPANY_SOFTWARE_TO_BUSINESS_FUNCTION_REQUEST,
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
    RESET_BUSINESS_FUNCTION_VALUE_REQUEST,
    UPDATE_BUSINESS_FUNCTION_DETAILS_REQUEST,
    UPDATE_BUSINESS_FUNCTION_EXAMPLES_REQUEST,
    UPDATE_BUSINESS_FUNCTION_REQUEST,
} from '@/store/actionTypes'


export const getBusinessFunctionsAction = () => ({
    type: GET_BUSINESS_FUNCTIONS_REQUEST,
})

export const onBusinessFunctionsResponseAction = (businessFunctions: any[]) => ({
    type: ON_BUSINESS_FUNCTIONS_RESPONSE,
    businessFunctions,
})

export const addBusinessFunctionAction = (name: string, parentId: number) => ({
    type: ADD_BUSINESS_FUNCTION_REQUEST,
    name,
    parentId,
})

export const onAddBusinessFunctionResponseAction = (createdBusinessFunction: any) => ({
    type: ON_ADD_BUSINESS_FUNCTION_RESPONSE,
    createdBusinessFunction,
})

export const updateBusinessFunctionAction = (businessFunctionId: number | string, name: string) => ({
    type: UPDATE_BUSINESS_FUNCTION_REQUEST,
    businessFunctionId,
    name,
})

export const onUpdateBusinessFunctionResponseAction = (updatedBusinessFunction: any) => ({
    type: ON_UPDATE_BUSINESS_FUNCTION_RESPONSE,
    updatedBusinessFunction,
})

export const deleteBusinessFunctionAction = (businessFunctionId: number | string) => ({
    type: DELETE_BUSINESS_FUNCTION_REQUEST,
    businessFunctionId,
})

export const getBusinessFunctionDetailsAction = (businessFunctionId: number, clearOldDetails: boolean = true) => ({
    type: GET_BUSINESS_FUNCTION_DETAILS_REQUEST,
    businessFunctionId,
    clearOldDetails,
})

export const onBusinessFunctionDetailsResponseAction = (businessFunctionByCompany: any) => ({
    type: ON_BUSINESS_FUNCTION_DETAILS_RESPONSE,
    businessFunctionByCompany,
})

export const updateBusinessFunctionDetailsAction = (
    businessFunctionByCompanyId: number,
    value: boolean,
    ftr: string,
    priority: string,
    reason: string,
    ruSoftwareAvailabilityStatus: string,
    softwareUsageStatus: string,
    targetSoftwareId: number,
    comment: string,
) => ({
    type: UPDATE_BUSINESS_FUNCTION_DETAILS_REQUEST,
    businessFunctionByCompanyId,
    value,
    ftr,
    priority,
    reason,
    ruSoftwareAvailabilityStatus,
    softwareUsageStatus,
    targetSoftwareId,
    comment,
})

export const attachNewCompanySoftwareToBusinessFunctionAction = (businessFunctionId: number, softwareId: number) => ({
    type: ATTACH_NEW_COMPANY_SOFTWARE_TO_BUSINESS_FUNCTION_REQUEST,
    businessFunctionId,
    softwareId,
})

export const createAndAttachNewCompanySoftwareToBusinessFunctionAction = (
    businessFunctionId: number,
    name: string,
    description: string,
    artNumber: string,
    registerNumber: string,
    mainClassId: number,
    additionalClassIds: number[],
    tagIds: number[],
) => ({
    type: CREATE_AND_ATTACH_NEW_COMPANY_SOFTWARE_TO_BUSINESS_FUNCTION_REQUEST,
    businessFunctionId,
    name,
    description,
    artNumber,
    registerNumber,
    mainClassId,
    additionalClassIds,
    tagIds,
})

export const createAndAddTargetSoftwareToBusinessFunctionAction = (
    businessFunctionId: number,
    name: string,
    description: string,
    artNumber: string,
    registerNumber: string,
    mainClassId: number,
    additionalClassIds: number[],
    tagIds: number[],
) => ({
    type: CREATE_AND_ADD_TARGET_SOFTWARE_TO_BUSINESS_FUNCTION_REQUEST,
    businessFunctionId,
    name,
    description,
    artNumber,
    registerNumber,
    mainClassId,
    additionalClassIds,
    tagIds,
})

export const attachCompanySoftwareToBusinessFunctionAction = (businessFunctionId: number, companySoftwareId: number) => ({
    type: ATTACH_COMPANY_SOFTWARE_TO_BUSINESS_FUNCTION_REQUEST,
    businessFunctionId,
    companySoftwareId,
})

export const detachCompanySoftwareFromBusinessFunctionAction = (businessFunctionId: number, companySoftwareId: number) => ({
    type: DETACH_COMPANY_SOFTWARE_FROM_BUSINESS_FUNCTION_REQUEST,
    businessFunctionId,
    companySoftwareId,
})

export const onAttachedCompanySoftwareUpdatedAction = (companySoftware: any[]) => ({
    type: ON_ATTACHED_COMPANY_SOFTWARE_UPDATED,
    companySoftware,
})

export const changeBusinessFunctionOrderAction = (
    businessFunctionId: number,
    newPosition: number,
    newParentId?: number,
) => ({
    type: CHANGE_BUSINESS_FUNCTION_ORDER,
    businessFunctionId,
    newPosition,
    newParentId,
})

export const downloadBusinessFunctionsReportAction = (isFullReport: boolean, isConsolidated: boolean = false) => ({
    type: DOWNLOAD_BUSINESS_FUNCTIONS_REPORT_REQUEST,
    isFullReport,
    isConsolidated,
})

export const onDownloadBusinessFunctionsReportResponseAction = () => ({
    type: ON_DOWNLOAD_BUSINESS_FUNCTIONS_REPORT_RESPONSE,
})

export const updateBusinessFunctionExamplesAction = (
    businessFunctionId: number,
    ftrExample: string,
    priorityExample: string,
    reasonExample: string,
) => ({
    type: UPDATE_BUSINESS_FUNCTION_EXAMPLES_REQUEST,
    businessFunctionId,
    ftrExample,
    priorityExample,
    reasonExample,
})

export const resetBusinessFunctionValueAction = (businessFunctionByCompanyId: number) => ({
    type: RESET_BUSINESS_FUNCTION_VALUE_REQUEST,
    businessFunctionByCompanyId,
})
