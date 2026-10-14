import {
    CREATE_IT_PROJECT_REQUEST,
    DELETE_IT_PROJECT_REQUEST,
    GET_IT_PROJECTS_REQUEST,
    ON_CREATE_IT_PROJECT_RESPONSE,
    ON_DELETE_IT_PROJECT_RESPONSE,
    ON_IT_PROJECTS_RESPONSE,
    ON_UPDATE_IT_PROJECT_RESPONSE,
    UPDATE_IT_PROJECT_REQUEST,
} from '@/store/actionTypes'

export const getITProjectsAction = () => ({
    type: GET_IT_PROJECTS_REQUEST,
})

export const onITProjectsResponseAction = (itProjects: any[]) => ({
    type: ON_IT_PROJECTS_RESPONSE,
    itProjects,
})

export const createITProjectAction = (
    name: string,
    description: string,
    purpose: string,
    initiator: string,
    leader: string,
    budget: number,
    startDate: string,
    endDate: string,
) => ({
    type: CREATE_IT_PROJECT_REQUEST,
    name,
    description,
    purpose,
    initiator,
    leader,
    budget,
    startDate,
    endDate,
})

export const onCreateITProjectResponseAction = (createdItProject: any) => ({
    type: ON_CREATE_IT_PROJECT_RESPONSE,
    createdItProject,
})

export const updateITProjectAction = (
    itProjectId: number,
    name: string,
    description: string,
    purpose: string,
    initiator: string,
    leader: string,
    budget: number,
    startDate: string,
    endDate: string,
) => ({
    type: UPDATE_IT_PROJECT_REQUEST,
    itProjectId,
    name,
    description,
    purpose,
    initiator,
    leader,
    budget,
    startDate,
    endDate,
})

export const onUpdateITProjectResponseAction = (updatedITProject: any) => ({
    type: ON_UPDATE_IT_PROJECT_RESPONSE,
    updatedITProject,
})

export const deleteITProjectAction = (itProjectId: number) => ({
    type: DELETE_IT_PROJECT_REQUEST,
    itProjectId,
})

export const onDeleteITProjectResponseAction = (itProjectId: number) => ({
    type: ON_DELETE_IT_PROJECT_RESPONSE,
    itProjectId,
})
