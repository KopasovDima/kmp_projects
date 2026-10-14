import {sendIsKmpRequest} from '@/services'

export const getCompanySoftwareRequest = async () => {
    return await sendIsKmpRequest('software/company/', 'GET', null, {UseChildCompanyId: true})
}

export const getCompanySoftwareByClassesRequest = async () => {
    return await sendIsKmpRequest('software/company/by_classes/', 'GET', null, {UseChildCompanyId: true})
}

export const getSoftwareClassesRequest = async () => {
    return await sendIsKmpRequest('software/classes/', 'GET')
}

export const getSoftwareTagsRequest = async () => {
    return await sendIsKmpRequest('software/tags/', 'GET')
}

export const getSoftwareRequest = async (includeVersions: boolean) => {
    return await sendIsKmpRequest(`software/${includeVersions ? '?include_versions=true' : ''}`, 'GET')
}

export const addCompanySoftwareRequest = async (
    softwareId: number,
    comment: string,
    implementationStatusId: number,
    copiesNumber: number,
    additionallyNeededCopiesNumber: number,
    softwareVersionIds: number[],
) => {
    return await sendIsKmpRequest(
        'software/company/add_software/',
        'POST',
        {
            software_id: softwareId,
            implementation_status_id: implementationStatusId,
            copies_number: copiesNumber,
            additionally_needed_copies_number: additionallyNeededCopiesNumber,
            ...(comment ? {comment} : {}),
            ...(softwareVersionIds ? {software_version_ids: softwareVersionIds.join(',')} : {}),
        },
        {UseChildCompanyId: true},
    )
}

export const updateCompanySoftwareRequest = async (
    companySoftwareId: number,
    comment: string,
    implementationStatusId: number,
    copiesNumber: number,
    additionallyNeededCopiesNumber: number,
    softwareVersionIds: number[],
) => {
    return await sendIsKmpRequest(
        `software/company/${companySoftwareId}/update/`,
        'PUT',
        {
            implementation_status_id: implementationStatusId,
            copies_number: copiesNumber,
            additionally_needed_copies_number: additionallyNeededCopiesNumber,
            ...(comment ? {comment} : {}),
            ...(softwareVersionIds ? {software_version_ids: softwareVersionIds.join(',')} : {}),
        },
        {UseChildCompanyId: true},
    )
}

export const deleteCompanySoftwareRequest = async (companySoftwareId: number) => {
    return await sendIsKmpRequest(
        `software/company/${companySoftwareId}/delete/`,
        'DELETE',
        null,
        {UseChildCompanyId: true},
    )
}

export const createSoftwareRequest = async (
    name: string,
    description: string,
    artNumber: string,
    registerNumber: string,
    mainClassId: number,
    additionalClassIds: number[],
    tagIds: number[],
) => {
    return await sendIsKmpRequest(
        'software/create/',
        'POST',
        {
            name,
            description,
            ...(artNumber ? {art_number: artNumber} : {}),
            ...(registerNumber ? {register_number: registerNumber} : {}),
            main_class_id: mainClassId,
            ...(additionalClassIds ? {additional_class_ids: additionalClassIds.join(',')} : {}),
            ...(tagIds ? {tag_ids: tagIds.join(',')} : {}),
        }
    )
}

export const updateSoftwareRequest = async (
    softwareId: number,
    name: string,
    description: string,
    artNumber: string,
    registerNumber: string,
    mainClassId: number,
    additionalClassIds: number[],
    tagIds: number[],
) => {
    return await sendIsKmpRequest(
        `software/${softwareId}/update/`,
        'PUT',
        {
            name,
            description,
            ...(artNumber ? {art_number: artNumber} : {}),
            ...(registerNumber ? {register_number: registerNumber} : {}),
            main_class_id: mainClassId,
            ...(additionalClassIds ? {additional_class_ids: additionalClassIds.join(',')} : {}),
            ...(tagIds ? {tag_ids: tagIds.join(',')} : {}),
        }
    )
}

export const getImplementationStatusesRequest = async () => {
    return await sendIsKmpRequest('implementation_statuses/', 'GET')
}

export const addSoftwareVersionRequest = async (softwareId: number, version: string) => {
    return await sendIsKmpRequest(
        `software/${softwareId}/versions/add/`,
        'POST',
        {
            version,
        }
    )
}

export const getSoftwareVersionsRequest = async (softwareId: number) => {
    return await sendIsKmpRequest(`software/${softwareId}/versions/`, 'GET')
}
