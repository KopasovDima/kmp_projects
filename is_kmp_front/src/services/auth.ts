import {sendAuthRequest} from '@/services'
import {get2FAToken, getRefreshToken} from '@/utils'

export const loginRequest = async (login: string, password: string) => {
    return await sendAuthRequest(
        'login/',
        'POST',
        {
            login,
            password,
        },
    )
}

export const login2FARequest = async (verificationCode: string) => {
    return await sendAuthRequest(
        'login_2fa/',
        'POST',
        {
            ['2fa_jwt_token']: get2FAToken(),
            verification_code: verificationCode,
        },
    )
}

export const getUserInfoRequest = async () => {
    return await sendAuthRequest('info/', 'GET')
}

export const checkAuthRequest = async () => {
    return await sendAuthRequest('check/', 'GET')
}

export const logoutRequest = async () => {
    return await sendAuthRequest('logout/', 'DELETE')
}

export const refreshTokenRequest = async () => {
    return await sendAuthRequest(
        'refresh/',
        'PUT',
        undefined,
        {'Authorization': 'Bearer ' + getRefreshToken()},
    )
}

export const requestResetPasswordRequest = async (email: string) => {
    return await sendAuthRequest(
        'request_password_reset/',
        'POST',
        {
            email,
        },
    )
}

export const resetPasswordRequest = async (newPassword: string, resetPasswordToken: string) => {
    return await sendAuthRequest(
        'reset_password/',
        'POST',
        {
            new_password: newPassword,
            reset_password_token: resetPasswordToken,
        },
    )
}

export const changePasswordRequest = async (newPassword: string) => {
    return await sendAuthRequest(
        'change_password/',
        'POST',
        {
            new_password: newPassword,
        },
    )
}

export const attachUserProfilePhotoRequest = async (photo: any) => {
    return await sendAuthRequest(
        'attach_profile_photo/',
        'POST',
        {
            0: {file: photo},
        },
    )
}
