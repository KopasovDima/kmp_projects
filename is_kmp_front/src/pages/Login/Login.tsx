import {useCallback, useEffect, useState} from 'react'
import {Button, Input, Typography} from 'antd'
import {useNavigate} from 'react-router'
import {useDispatch, useSelector} from 'react-redux'
import {clearErrorAction, loginAction, setErrorAction} from '@/store/actions'
import {getAuthSelector} from '@/store/selectors'
import {getErrorSelector} from '@/store/selectors/error.ts'
import {LOGIN_REQUEST} from '@/store/actionTypes'
import {KeyboardKeyTracker} from '@/components'
import './Login.css'
import {COLORS} from '@/consts'

const {Paragraph} = Typography

export const Login = () => {
    useEffect(() => {
        window.document.title = 'Авторизация'
    }, [])

    const navigate = useNavigate()
    const { isLoading } = useSelector(getAuthSelector)
    const error = useSelector(getErrorSelector)
    const dispatch = useDispatch()

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')

    const validateForm = () => {
        if (!email && !password) {
            return 'Не заполнены email и пароль'
        }
        if (!email) {
            return 'Не заполнен email'
        }
        if (!password) {
            return 'Не заполнен пароль'
        }
        return ''
    }

    useEffect(() => {
        return () => {
            dispatch(clearErrorAction(LOGIN_REQUEST))
        }
    }, [])

    const clearErrorLocal = useCallback(() => {
        if (error[LOGIN_REQUEST]) dispatch(clearErrorAction(LOGIN_REQUEST))
    }, [error])

    const onSubmit = () => {
        if (isLoading) return

        const validationError = validateForm()
        if (validationError) {
            dispatch(setErrorAction(LOGIN_REQUEST, validationError))
            return
        }

        clearErrorLocal()

        const data = new FormData()
        data.append('login', email)
        data.append('password', password)

        dispatch(loginAction(email, password))
    }

    const onInputEmail = (e: any) => {
        setEmail(e.target.value)
        clearErrorLocal()
    }

    const onInputPassword = (e: any) => {
        setPassword(e.target.value)
        clearErrorLocal()
    }

    return (
        <div
            className={'loginPage'}
            style={{
                background: COLORS.PALE_BLUE,
            }}
        >
            <KeyboardKeyTracker keys={['Enter']} onPress={() => onSubmit()} />
            <div className={'loginContainer'}>
                <h3>Авторизация</h3>
                <div style={{marginBottom: '15px'}}>
                    <Paragraph
                        style={{
                            margin: 8,
                            textAlign: 'left',
                        }}
                    >
                        Email
                    </Paragraph>
                    <Input
                        placeholder={'Введите email'}
                        type={'email'}
                        onChange={onInputEmail}
                        value={email}
                        onBlur={clearErrorLocal}
                        style={{width: '100%', padding: '8px'}}
                    />
                </div>

                <div style={{marginBottom: '15px'}}>
                    <Paragraph
                        style={{
                            margin: 8,
                            textAlign: 'left',
                        }}
                    >
                        Пароль
                    </Paragraph>
                    <Input
                        placeholder={'Введите пароль'}
                        type={'password'}
                        onChange={onInputPassword}
                        value={password}
                        onBlur={clearErrorLocal}
                        style={{width: '100%', padding: '8px'}}
                    />
                </div>

                <Button
                    tabIndex={-1}
                    type={'primary'}
                    style={{
                        width: '80%',
                        padding: '10px',
                        margin: 20,
                        backgroundColor: COLORS.DARK_BLUE,
                    }}
                    onClick={onSubmit}
                    loading={isLoading}
                >
                    Войти
                </Button>

                {error[LOGIN_REQUEST] && (
                    <div style={{color: 'red', marginTop: '10px', textAlign: 'center'}}>
                        {error[LOGIN_REQUEST]}
                    </div>
                )}
            </div>

            <a
                style={{
                    textDecoration: 'underline',
                    color: COLORS.DARK_BLUE,
                    fontSize: 14,
                }}
                href={'/request-reset-password'}
                onClick={(e) => {
                    e.preventDefault()
                    navigate('/request-reset-password')
                }}
            >
                Восстановить пароль
            </a>
        </div>
    )
}
