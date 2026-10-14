import {
    GET_AUTH_INFO_REQUEST,
    GET_AUTH_INFO_RESPONSE,
    LOGIN_2FA_REQUEST,
    LOGIN_REQUEST,
    LOGIN_RESPONSE,
    LOGOUT_REQUEST,
    LOGOUT_RESPONSE,
    ON_ATTACH_USER_PROFILE_PHOTO_RESPONSE,
    ON_CHANGE_PASSWORD_RESPONSE,
    REQUEST_CHANGE_PASSWORD,
    SELECT_CHILD_COMPANY,
    SET_IS_LOGGED_IN,
    SET_IS_ONLINE,
} from '@/store/actionTypes'
import secureLocalStorage from 'react-secure-storage'

const initialState: {
    isLoggedIn: boolean | undefined,
    lastLoggedInUpdate: any,
    isOnline: boolean,
    userInfo: any,
    userSelectedChildCompany: any,
    isLoading: boolean,
    changePasswordRequired: boolean,
} = {
    isLoggedIn: undefined,
    lastLoggedInUpdate: undefined,
    isOnline: true,
    userInfo: undefined,
    userSelectedChildCompany: secureLocalStorage.getItem('userSelectedChildCompany'),
    isLoading: false,
    changePasswordRequired: false,
}

export const authReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case SET_IS_LOGGED_IN: {
            return {
                ...state,
                isLoggedIn: action.isLoggedIn,
                lastLoggedInUpdate: (new Date()).toISOString(),
                userInfo: action.isLoggedIn ? state.userInfo : undefined,
            }
        }
        case SET_IS_ONLINE: {
            return {
                ...state,
                isOnline: action.isOnline,
            }
        }
        case GET_AUTH_INFO_REQUEST:
        case LOGIN_2FA_REQUEST:
        case LOGIN_REQUEST:
        case LOGOUT_REQUEST: {
            return {
                ...state,
                isLoading: true,
            }
        }
        case LOGIN_RESPONSE:
        case LOGOUT_RESPONSE:
        case GET_AUTH_INFO_RESPONSE: {
            return {
                ...state,
                isLoading: false,
                userInfo: action.userInfo,
            }
        }
        case SELECT_CHILD_COMPANY: {
            return {
                ...state,
                userSelectedChildCompany: action.company,
            }
        }
        case REQUEST_CHANGE_PASSWORD: {
            return {
                ...state,
                changePasswordRequired: true,
            }
        }
        case ON_CHANGE_PASSWORD_RESPONSE: {
            return {
                ...state,
                changePasswordRequired: false,
            }
        }
        case ON_ATTACH_USER_PROFILE_PHOTO_RESPONSE:
            return {
                ...state,
                userInfo: {
                    ...state.userInfo,
                    photo: action.newPhotoUrl,
                },
            }
        default:
            return {...state}
    }
}