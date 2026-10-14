import {sendIsKmpRequest} from '@/services'

export const getBusinessFunctionsRequest = async () => {
    return await sendIsKmpRequest(
        'business_functions/?include_software=true',
        'GET',
        null,
        {UseChildCompanyId: true},
    )
}

export const updateBusinessFunctionRequest = async (businessFunctionId: number, name: string) => {
    return await sendIsKmpRequest(
        `business_functions/${businessFunctionId}/update/`,
        'PUT',
        {name},
    )
}

export const addBusinessFunctionRequest = async (name: string, parentId: number) => {
    return await sendIsKmpRequest(
        `business_functions/create/`,
        'POST',
        {name, parent_id: parentId},
    )
}

export const deleteBusinessFunctionRequest = async (businessFunctionId: number) => {
    return await sendIsKmpRequest(`business_functions/${businessFunctionId}/delete/`, 'DELETE')
}

export const getBusinessFunctionDetailsRequest = async (businessFunctionId: number) => {
    return await sendIsKmpRequest(
        `business_functions/${businessFunctionId}/details/`,
        'GET',
        null,
        {UseChildCompanyId: true},
    )
}

export const updateBusinessFunctionDetailsRequest = async (
    businessFunctionByCompanyId: number,
    value: boolean,
    ftr: string,
    priority: string,
    reason: string,
    ruSoftwareAvailabilityStatus: string,
    softwareUsageStatus: string,
    targetSoftwareId: number,
    comment: string,
) => {
    return await sendIsKmpRequest(
        `business_function_by_company/${businessFunctionByCompanyId}/update/`,
        'PUT',
        {
            value,
            ftr,
            priority,
            reason,
            ru_software_availability_status: ruSoftwareAvailabilityStatus,
            software_usage_status: softwareUsageStatus,
            target_software_id: targetSoftwareId,
            comment: comment,
        }
    )
}

export const attachNewCompanySoftwareToBusinessFunctionRequest = async (
    businessFunctionId: number,
    softwareId: number,
) => {
    return await sendIsKmpRequest(
        `business_functions/${businessFunctionId}/attach_new_company_software/${softwareId}/`,
        'PATCH',
        null,
        {UseChildCompanyId: true},
    )
}

export const attachCompanySoftwareToBusinessFunctionRequest = async (
    businessFunctionId: number,
    companySoftwareId: number,
) => {
    return await sendIsKmpRequest(
        `business_functions/${businessFunctionId}/attach_company_software/${companySoftwareId}/`,
        'PATCH',
        null,
        {UseChildCompanyId: true},
    )
}

export const detachCompanySoftwareFromBusinessFunctionRequest = async (
    businessFunctionId: number,
    companySoftwareId: number,
) => {
    return await sendIsKmpRequest(
        `business_functions/${businessFunctionId}/detach_company_software/${companySoftwareId}/`,
        'PATCH',
        {keep_value_true: true},
        {UseChildCompanyId: true},
    )
}


export const changeBusinessFunctionOrderRequest = async (
    businessFunctionId: number,
    newPosition: number,
    newParentId?: number,
) => {
    return await sendIsKmpRequest(
        `business_functions/${businessFunctionId}/change_order/`,
        'PATCH',
        {
            new_position: newPosition,
            ...(newParentId ? {new_parent_id: newParentId} : {}),
        },
        {UseChildCompanyId: true},
    )
}

export const downloadBusinessFunctionsReportRequest = async (isFullReport: boolean, isConsolidated: boolean) => {
    return await sendIsKmpRequest(
        isFullReport ?
            `business_functions/download_full_report/?allow_empty_values=true${isConsolidated ? '&consolidated=true' : ''}` :
            'business_functions/download_report/',
        'GET',
        null,
        {UseChildCompanyId: true},
    )
}

export const updateBusinessFunctionExamplesRequest = async (
    businessFunctionId: number,
    ftrExample: string,
    priorityExample: string,
    reasonExample: string,
) => {
    return await sendIsKmpRequest(
        `business_functions/${businessFunctionId}/update_examples/`,
        'PUT',
        {
            ftr_example: ftrExample,
            priority_example: priorityExample,
            reason_example: reasonExample,
        }
    )
}

export const resetBusinessFunctionValueRequest = async (businessFunctionByCompanyId: number) => {
    return await sendIsKmpRequest(
        `business_function_by_company/${businessFunctionByCompanyId}/reset/`,
        'PATCH',
        {
            keep_old_values: true,
        },
        {UseChildCompanyId: true},
    )
}
