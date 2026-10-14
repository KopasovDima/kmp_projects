import {
    ATTACH_USER_PROFILE_PHOTO_REQUEST,
    CHANGE_PASSWORD_REQUEST,
    CHECK_AUTH,
    GET_AUTH_INFO_REQUEST,
    GET_AUTH_INFO_RESPONSE,
    LOGIN_2FA_REQUEST,
    LOGIN_REQUEST,
    LOGIN_RESPONSE,
    LOGOUT_REQUEST,
    LOGOUT_RESPONSE,
    ON_ATTACH_USER_PROFILE_PHOTO_RESPONSE,
    ON_CHANGE_PASSWORD_RESPONSE,
    REFRESH_TOKEN_REQUEST,
    REQUEST_CHANGE_PASSWORD,
    REQUEST_RESET_PASSWORD_REQUEST,
    RESET_PASSWORD_REQUEST,
    SELECT_CHILD_COMPANY,
    SET_IS_LOGGED_IN,
    SET_IS_ONLINE,
} from '@/store/actionTypes'

export const checkAuthAction = () => ({
    type: CHECK_AUTH,
})

export const getAuthUserInfoAction = () => ({
    type: GET_AUTH_INFO_REQUEST,
})

export const setIsLoggedInAction = (isLoggedIn: boolean) => ({
    type: SET_IS_LOGGED_IN,
    isLoggedIn,
})

export const setIsOnlineAction = (isOnline: boolean) => ({
    type: SET_IS_ONLINE,
    isOnline,
})

export const getAuthUserInfoResponseAction = (userInfo: any) => ({
    type: GET_AUTH_INFO_RESPONSE,
    userInfo,
})

export const loginAction = (login: string, password: string) => ({
    type: LOGIN_REQUEST,
    login,
    password,
})

export const login2FAAction = (verificationCode: string) => ({
    type: LOGIN_2FA_REQUEST,
    verificationCode,
})

export const loginResponseAction = () => ({
    type: LOGIN_RESPONSE,
})

export const logoutAction = () => ({
    type: LOGOUT_REQUEST,
})

export const logoutResponseAction = () => ({
    type: LOGOUT_RESPONSE,
})

export const refreshTokenAction = (resentAction?: any) => ({
    type: REFRESH_TOKEN_REQUEST,
    resentAction,
})

export const requestResetPasswordAction = (email: string, onSuccess: () => void) => ({
    type: REQUEST_RESET_PASSWORD_REQUEST,
    email,
    onSuccess,
})

export const resetPasswordAction = (newPassword: string, resetPasswordToken: string, onSuccess: () => void) => ({
    type: RESET_PASSWORD_REQUEST,
    newPassword,
    resetPasswordToken,
    onSuccess,
})

export const selectChildCompanyAction = (company: any) => ({
    type: SELECT_CHILD_COMPANY,
    company,
})

export const requestChangePasswordAction = () => ({
    type: REQUEST_CHANGE_PASSWORD,
})

export const changePasswordAction = (newPassword: string) => ({
    type: CHANGE_PASSWORD_REQUEST,
    newPassword,
})

export const onChangePasswordResponseAction = () => ({
    type: ON_CHANGE_PASSWORD_RESPONSE,
})

export const attachUserProfilePhotoAction = (photo: any) => ({
    type: ATTACH_USER_PROFILE_PHOTO_REQUEST,
    photo,
})

export const onAttachUserProfilePhotoResponseAction = (newPhotoUrl: string) => ({
    type: ON_ATTACH_USER_PROFILE_PHOTO_RESPONSE,
    newPhotoUrl,
})
