import {useCallback, useEffect, useRef, useState} from 'react'
import {Input} from 'antd'
import {useNavigate} from 'react-router'
import {useDispatch, useSelector} from 'react-redux'
import {clearErrorAction, login2FAAction} from '@/store/actions'
import {getAuthSelector} from '@/store/selectors'
import {getErrorSelector} from '@/store/selectors/error.ts'
import {LOGIN_2FA_REQUEST} from '@/store/actionTypes'
import './Login2FA.css'
import {COLORS} from '@/consts'
import {get2FAToken} from '@/utils'

export const Login2FA = () => {
    useEffect(() => {
        window.document.title = 'Авторизация - Подтверждение'

        return () => {
            dispatch(clearErrorAction(LOGIN_2FA_REQUEST))
        }
    }, [])

    const navigate = useNavigate()
    const {isLoggedIn, isLoading} = useSelector(getAuthSelector)
    const error = useSelector(getErrorSelector)
    const dispatch = useDispatch()

    const inputRef = useRef<any>(null)

    const [code, setCode] = useState<string>('')

    const clearErrorLocal = useCallback(() => {
        if (error[LOGIN_2FA_REQUEST]) dispatch(clearErrorAction(LOGIN_2FA_REQUEST))
    }, [error])

    useEffect(() => {
        if (!get2FAToken()) navigate('/login')
        if (isLoggedIn) navigate('/')
    })

    useEffect(() => {
        inputRef?.current?.focus()
    }, [inputRef])

    useEffect(() => {
        if (error[LOGIN_2FA_REQUEST]) {
            setTimeout(() => {
                clearErrorLocal()
                setCode('')
                inputRef?.current?.focus()
            }, 1500)
        }
    }, [error])

    const onInputCode = useCallback((value: string[]) => {
        if (isLoading) return
        const inputCode = value.join('')
        setCode(inputCode)
        clearErrorLocal()
        if (inputCode.length === 6) {
            dispatch(login2FAAction(inputCode))
            inputRef?.current?.blur()
        }
    }, [isLoading, inputRef])

    return (
        <div
            className={'login2FAPage'}
            style={{
                background: COLORS.PALE_BLUE,
            }}
        >
            <div className={'login2FAContainer'}>
                <h3>Подтвердите вход</h3>
                <p>
                    В целях безопасности на электронную почту был отправлен код для подтверждения входа.
                    Введите его ниже, чтобы завершить авторизацию
                </p>
                <div style={{marginTop: 30}}>
                    <Input.OTP
                        ref={inputRef}
                        value={code}
                        onInput={onInputCode}
                        formatter={(value) => value.replace(/\D/g, '')}
                        separator={(i) => i % 2 === 0 ? '' : <div style={{width: 14}}/>}
                        length={6}
                        style={{
                            fontWeight: 'bold'
                        }}
                    />
                </div>

                <div
                    style={{
                        color: 'red',
                        marginTop: '10px',
                        textAlign: 'center',
                        width: '100%',
                        opacity: error[LOGIN_2FA_REQUEST] ? 1 : 0,
                    }}
                >
                    {error[LOGIN_2FA_REQUEST] || '-'}
                </div>
            </div>
        </div>
    )
}
