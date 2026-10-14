import {CLEAR_ERROR, SET_ERROR} from '@/store/actionTypes'

export const setErrorAction = (errorType: string, error: string) => ({
    type: SET_ERROR,
    errorType,
    error,
})

export const clearErrorAction = (errorType: string) => ({
    type: CLEAR_ERROR,
    errorType,
})
