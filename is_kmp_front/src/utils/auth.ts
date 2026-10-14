import secureLocalStorage from 'react-secure-storage'
import {_2FA_TOKEN_KEY, AUTH_TOKEN_KEY, ENV, REFRESH_TOKEN_KEY} from '@/consts'
import Cookies from 'js-cookie'

export const getAuthToken = () => {
    return secureLocalStorage.getItem(AUTH_TOKEN_KEY)
}

export const saveAuthToken = (authToken: string) => {
    secureLocalStorage.setItem(AUTH_TOKEN_KEY, authToken)
}

export const deleteAuthToken = () => {
    secureLocalStorage.removeItem(AUTH_TOKEN_KEY)
}

export const getRefreshToken = () => {
    return Cookies.get(REFRESH_TOKEN_KEY)
}

export const saveRefreshToken = (refreshToken: string) => {
    Cookies.set(
        REFRESH_TOKEN_KEY,
        refreshToken,
        {
            secure: ENV.AUTH_SERVER_URL.indexOf('https') === 0,
            expires: 10,
        },
    )
}

export const deleteRefreshToken = () => {
    Cookies.remove(REFRESH_TOKEN_KEY)
}

export const get2FAToken = () => {
    return secureLocalStorage.getItem(_2FA_TOKEN_KEY)
}

export const save2FAToken = (_2FAToken: string) => {
    secureLocalStorage.setItem(_2FA_TOKEN_KEY, _2FAToken)
}

export const delete2FAToken = () => {
    secureLocalStorage.removeItem(_2FA_TOKEN_KEY)
}