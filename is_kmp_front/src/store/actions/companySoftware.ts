import {
    ADD_COMPANY_SOFTWARE_REQUEST,
    ADD_SOFTWARE_VERSION_REQUEST,
    CREATE_SOFTWARE_REQUEST,
    DELETE_COMPANY_SOFTWARE_REQUEST,
    GET_COMPANY_SOFTWARE_BY_CLASSES_REQUEST,
    GET_COMPANY_SOFTWARE_REQUEST,
    GET_IMPLEMENTATION_STATUSES_REQUEST,
    GET_SOFTWARE_CLASSES_REQUEST,
    GET_SOFTWARE_REQUEST,
    GET_SOFTWARE_TAGS_REQUEST,
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
    UPDATE_COMPANY_SOFTWARE_REQUEST,
    UPDATE_SOFTWARE_REQUEST,
} from '@/store/actionTypes'

export const getCompanySoftwareAction = () => ({
    type: GET_COMPANY_SOFTWARE_REQUEST,
})

export const onCompanySoftwareResponseAction = (companySoftware: any[]) => ({
    type: ON_COMPANY_SOFTWARE_RESPONSE,
    companySoftware,
})

export const getCompanySoftwareByClassesAction = () => ({
    type: GET_COMPANY_SOFTWARE_BY_CLASSES_REQUEST,
})

export const onCompanySoftwareByClassesResponseAction = (companySoftware) => ({
    type: ON_COMPANY_SOFTWARE_BY_CLASSES_RESPONSE,
    companySoftware,
})

export const getSoftwareClassesAction = () => ({
    type: GET_SOFTWARE_CLASSES_REQUEST,
})

export const onSoftwareClassesResponseAction = (softwareClasses) => ({
    type: ON_SOFTWARE_CLASSES_RESPONSE,
    softwareClasses,
})

export const getSoftwareTagsAction = () => ({
    type: GET_SOFTWARE_TAGS_REQUEST,
})

export const onSoftwareTagsResponseAction = (softwareTags) => ({
    type: ON_SOFTWARE_TAGS_RESPONSE,
    softwareTags,
})

export const getSoftwareAction = (includeVersions = false) => ({
    type: GET_SOFTWARE_REQUEST,
    includeVersions,
})

export const onSoftwareResponseAction = (software) => ({
    type: ON_SOFTWARE_RESPONSE,
    software,
})

export const addCompanySoftwareAction = (
    softwareId: number,
    comment: string,
    implementationStatusId: number,
    copiesNumber: number,
    additionallyNeededCopiesNumber: number,
    softwareVersionIds: number[],
) => ({
    type: ADD_COMPANY_SOFTWARE_REQUEST,
    softwareId,
    comment,
    implementationStatusId,
    copiesNumber,
    additionallyNeededCopiesNumber,
    softwareVersionIds,
})

export const onAddCompanySoftwareResponseAction = (newCompanySoftware) => ({
    type: ON_ADD_COMPANY_SOFTWARE_RESPONSE,
    newCompanySoftware,
})

export const updateCompanySoftwareAction = (
    companySoftwareId: number,
    comment: string,
    implementationStatusId: number,
    copiesNumber: number,
    additionallyNeededCopiesNumber: number,
    softwareVersionIds: number[] = [],
) => ({
    type: UPDATE_COMPANY_SOFTWARE_REQUEST,
    companySoftwareId,
    comment,
    implementationStatusId,
    copiesNumber,
    additionallyNeededCopiesNumber,
    softwareVersionIds,
})

export const onUpdateCompanySoftwareResponseAction = (updatedCompanySoftware) => ({
    type: ON_UPDATE_COMPANY_SOFTWARE_RESPONSE,
    updatedCompanySoftware,
})

export const deleteCompanySoftwareAction = (companySoftwareId: number) => ({
    type: DELETE_COMPANY_SOFTWARE_REQUEST,
    companySoftwareId,
})

export const onDeleteCompanySoftwareResponseAction = (companySoftwareId: number) => ({
    type: ON_DELETE_COMPANY_SOFTWARE_RESPONSE,
    companySoftwareId,
})

export const createSoftwareAction = (
    name: string,
    description: string,
    artNumber: string,
    registerNumber: string,
    mainClassId: number,
    additionalClassIds: number[],
    tagIds: number[],
) => ({
    type: CREATE_SOFTWARE_REQUEST,
    name,
    description,
    artNumber,
    registerNumber,
    mainClassId,
    additionalClassIds,
    tagIds,
})

export const updateSoftwareAction = (
    softwareId: number,
    name: string,
    description: string,
    artNumber: string,
    registerNumber: string,
    mainClassId: number,
    additionalClassIds: number[],
    tagIds: number[],
) => ({
    type: UPDATE_SOFTWARE_REQUEST,
    softwareId,
    name,
    description,
    artNumber,
    registerNumber,
    mainClassId,
    additionalClassIds,
    tagIds,
})

export const onUpdateSoftwareResponseAction = (updatedSoftware: any) => ({
    type: ON_UPDATE_SOFTWARE_RESPONSE,
    updatedSoftware,
})

export const getImplementationStatusesAction = () => ({
    type: GET_IMPLEMENTATION_STATUSES_REQUEST,
})

export const onImplementationStatusesResponseAction = (implementationStatuses: any[]) => ({
    type: ON_IMPLEMENTATION_STATUSES_RESPONSE,
    implementationStatuses,
})

export const addSoftwareVersionAction = (softwareId: number, version: string) => ({
    type: ADD_SOFTWARE_VERSION_REQUEST,
    softwareId,
    version,
})

export const softwareVersionsUpdatedAction = (softwareId: number, versions: any[]) => ({
    type: SOFTWARE_VERSIONS_UPDATED_REQUEST,
    softwareId,
    versions,
})
