import {all, call, put, select, takeLatest, throttle} from 'redux-saga/effects'

import {
    getAuthUserInfoAction,
    getAuthUserInfoResponseAction,
    loginResponseAction,
    logoutResponseAction,
    onAttachUserProfilePhotoResponseAction,
    onChangePasswordResponseAction,
    openNotificationAction,
    setErrorAction,
    setIsLoggedInAction
} from '@/store/actions'
import {
    ATTACH_USER_PROFILE_PHOTO_REQUEST,
    CHANGE_PASSWORD_REQUEST,
    CHECK_AUTH,
    GET_AUTH_INFO_REQUEST,
    LOGIN_2FA_REQUEST,
    LOGIN_REQUEST,
    LOGOUT_REQUEST,
    REFRESH_TOKEN_REQUEST,
    REQUEST_RESET_PASSWORD_REQUEST,
    RESET_PASSWORD_REQUEST,
} from '@/store/actionTypes'
import {
    attachUserProfilePhotoRequest,
    changePasswordRequest,
    checkAuthRequest,
    getUserInfoRequest,
    login2FARequest,
    loginRequest,
    logoutRequest,
    refreshTokenRequest,
    requestResetPasswordRequest,
    resetPasswordRequest,
} from '@/services'
import {
    delete2FAToken,
    deleteAuthToken,
    deleteRefreshToken,
    getRefreshToken,
    save2FAToken,
    saveAuthToken,
    saveRefreshToken
} from '@/utils'
import {processError} from '@/store/sagas/rootSaga.ts'

function* checkAuthSaga(action: any) {
    try {
        yield call(checkAuthRequest)
        yield put(getAuthUserInfoAction())
        yield put(setIsLoggedInAction(true))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* getAuthUserInfoSaga(action: any) {
    try {
        const response = yield call(getUserInfoRequest)
        yield put(getAuthUserInfoResponseAction(response))
    } catch (error) {
        yield call(processError, action, error)
        yield put(getAuthUserInfoResponseAction({}))
    }
}

function* loginSaga(action: any) {
    try {
        const response = yield call(loginRequest, action.login, action.password)
        if (response['2fa_token']) {
            save2FAToken(response['2fa_token'])
            window.location.replace('/login-2fa')
        }
    } catch (error) {
        yield call(processError, action, error)
    } finally {
        yield put(loginResponseAction())
    }
}

function* login2FASaga(action: any) {
    try {
        const response = yield call(login2FARequest, action.verificationCode)

        saveAuthToken(response.access)
        saveRefreshToken(response.refresh)
        yield put(setIsLoggedInAction(true))
        yield put(getAuthUserInfoAction())
        delete2FAToken()
    } catch (error: any) {
        yield put(setErrorAction(action.type, error.error))
        if (error.error?.toLowerCase()?.indexOf('необходима авторизация') !== -1) {
            yield put(
                openNotificationAction(
                    'Ошибка',
                    'Код подтверждения больше не действителен',
                    {
                        nType: 'error',
                    }
                )
            )
            delete2FAToken()
        }
    } finally {
        yield put(loginResponseAction())
    }
}

function* logoutSaga(action: any) {
    try {
        yield call(logoutRequest)
        deleteAuthToken()
        deleteRefreshToken()
        yield put(setIsLoggedInAction(false))
    } catch (error) {
        yield call(processError, action, error)
    } finally {
        yield put(logoutResponseAction())
    }
}

function* refreshTokenSaga(action: any) {
    try {
        if (getRefreshToken()) {
            const response = yield call(refreshTokenRequest)
            saveAuthToken(response.access)
            saveRefreshToken(response.refresh)
            if (action.resentAction) yield put(action.resentAction)
            yield put(setIsLoggedInAction(true))
        } else throw {status: 401}
    } catch (error) {
        if ((error as any).status === 401) {
            deleteAuthToken()
            deleteRefreshToken()
            window.location.replace('/login')
            yield put(setIsLoggedInAction(false))
        }
        yield put(setErrorAction(action.type, (error as any).error))
    }
}

function* requestResetPasswordSaga(action) {
    try {
        yield call(requestResetPasswordRequest, action.email)
        yield call(action.onSuccess)
    } catch (error) {
        yield put(setErrorAction(action.type, (error as any).error))
    }
}

function* resetPasswordSaga(action) {
    try {
        yield call(resetPasswordRequest, action.newPassword, action.resetPasswordToken)
        yield call(action.onSuccess)
    } catch (error: any) {
        let errorMessage = error.error
        if (error.status === 401) {
            errorMessage = 'Недействительный ключ восстановления пароля. Получите новое письмо на восстановление пароля'
        }
        yield put(setErrorAction(action.type, errorMessage))
    }
}

function* changePasswordSaga(action) {
    try {
        const {changePasswordRequired} = yield select(state => state.auth)
        yield call(changePasswordRequest, action.newPassword)
        yield put(onChangePasswordResponseAction())
        if (changePasswordRequired) {
            window.location.pathname = '/login'
            window.location.reload()
        } else {
            yield put(
                openNotificationAction(
                    '',
                    'Пароль успешно изменён',
                    {
                        nType: 'success',
                    }
                )
            )
        }
    } catch (error: any) {
        yield call(processError, action, error)
    }
}

function* attachUserProfilePhotoSaga(action) {
    try {
        const response = yield call(attachUserProfilePhotoRequest, action.photo)
        yield put(onAttachUserProfilePhotoResponseAction(response?.user_profile_photo))
    } catch (error: any) {
        yield call(processError, action, error)
    }
}

function* authSagas() {
    yield all([
        takeLatest(CHECK_AUTH, checkAuthSaga),
        takeLatest(GET_AUTH_INFO_REQUEST, getAuthUserInfoSaga),
        takeLatest(LOGIN_REQUEST, loginSaga),
        takeLatest(LOGIN_2FA_REQUEST, login2FASaga),
        takeLatest(LOGOUT_REQUEST, logoutSaga),
        throttle(10000, REFRESH_TOKEN_REQUEST, refreshTokenSaga),
        takeLatest(REQUEST_RESET_PASSWORD_REQUEST, requestResetPasswordSaga),
        takeLatest(RESET_PASSWORD_REQUEST, resetPasswordSaga),
        takeLatest(CHANGE_PASSWORD_REQUEST, changePasswordSaga),
        takeLatest(ATTACH_USER_PROFILE_PHOTO_REQUEST, attachUserProfilePhotoSaga),
    ])
}

export default authSagas