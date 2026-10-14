import {CLEAR_ERROR, SET_ERROR} from '@/store/actionTypes'

import {AnyObject} from 'antd/es/_util/type'

const initialState: {
    [key: string]: string
} = {}

export const errorReducer = (state = initialState, action: AnyObject) => {
    switch (action.type) {
    case SET_ERROR: {
        return {
            ...state,
            [action.errorType]: action.error,
        }
    }
    case CLEAR_ERROR: {
        const newState = {...state}
        delete newState[action.errorType]
        return newState
    }
    default:
        return {...state}
    }
}