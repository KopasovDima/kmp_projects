import {
    GET_IT_PROJECTS_REQUEST,
    ON_CREATE_IT_PROJECT_RESPONSE,
    ON_DELETE_IT_PROJECT_RESPONSE,
    ON_IT_PROJECTS_RESPONSE,
    ON_UPDATE_IT_PROJECT_RESPONSE
} from '@/store/actionTypes'

const initialState: {
    itProjects: any[]
    isLoading: boolean
} = {
    itProjects: [],
    isLoading: false,
}

export const itProjectsReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case GET_IT_PROJECTS_REQUEST: {
            return {
                ...state,
                isLoading: true,
            }
        }
        case ON_IT_PROJECTS_RESPONSE: {
            return {
                ...state,
                itProjects: action.itProjects,
                isLoading: false,
            }
        }
        case ON_CREATE_IT_PROJECT_RESPONSE: {
            return {
                ...state,
                itProjects: [
                    ...state.itProjects,
                    action.createdItProject,
                ],
            }
        }
        case ON_UPDATE_IT_PROJECT_RESPONSE: {
            return {
                ...state,
                itProjects: state.itProjects.map((itProject) => {
                    return itProject.id === action.updatedITProject?.id ? {
                        ...action.updatedITProject,
                    } : itProject
                }),
            }
        }
        case ON_DELETE_IT_PROJECT_RESPONSE: {
            return {
                ...state,
                itProjects: state.itProjects.filter((itProject) => itProject.id !== action.itProjectId),
            }
        }
        default:
            return {...state}
    }
}