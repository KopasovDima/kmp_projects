import {CLEAR_ERROR, SET_ERROR} from '@/store/actionTypes'

export const setError = (errorType: string, error: string) => ({
    type: SET_ERROR,
    errorType,
    error,
})

export const clearError = (errorType: string) => ({
    type: CLEAR_ERROR,
    errorType,
})
