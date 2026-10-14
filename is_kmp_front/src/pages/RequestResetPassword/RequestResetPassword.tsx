import {useCallback, useEffect, useState} from 'react'
import {Button, Input, Typography} from 'antd'
import {useNavigate} from 'react-router'
import {useDispatch, useSelector} from 'react-redux'
import {clearErrorAction, requestResetPasswordAction, setErrorAction} from '@/store/actions'
import {getAuthSelector} from '@/store/selectors'
import {getErrorSelector} from '@/store/selectors/error.ts'
import {REQUEST_RESET_PASSWORD_REQUEST} from '@/store/actionTypes'
import {KeyboardKeyTracker} from '@/components'
import './RequestResetPassword.css'
import {COLORS} from '@/consts'

const {Paragraph} = Typography

export const RequestResetPassword = () => {
    useEffect(() => {
        window.document.title = 'Сброс пароля'
    }, [])

    const navigate = useNavigate()
    const { isLoggedIn } = useSelector(getAuthSelector)
    const error = useSelector(getErrorSelector)
    const dispatch = useDispatch()

    const [email, setEmail] = useState<string>('')
    const [emailSend, setEmailSend] = useState<boolean>(false)

    const validateForm = () => {
        if (!email) {
            return 'Не заполнен email'
        }
        return ''
    }
    
    useEffect(() => {
        if (isLoggedIn) navigate('/')
    })

    useEffect(() => {
        return () => {
            clearErrorLocal()
        }
    }, [])

    const clearErrorLocal = useCallback(() => {
        if (error[REQUEST_RESET_PASSWORD_REQUEST]) dispatch(clearErrorAction(REQUEST_RESET_PASSWORD_REQUEST))
        setEmailSend(false)
    }, [error])

    const onSubmit = async () => {
        const validationError = validateForm()
        if (validationError) {
            dispatch(setErrorAction(REQUEST_RESET_PASSWORD_REQUEST, validationError))
            return
        }

        clearErrorLocal()

        dispatch(requestResetPasswordAction(email, () => setEmailSend(true)))
    }

    const onInputEmail = (e: any) => {
        setEmail(e.target.value)
        clearErrorLocal()
    }

    return (
        <div
            className={'requestResetPasswordPage'}
            style={{
                background: COLORS.PALE_BLUE,
            }}
        >
            {emailSend && !error[REQUEST_RESET_PASSWORD_REQUEST] ? (
                <div className={'requestResetPasswordContainer'}>
                    <h3>Восстановление пароля</h3>
                    <p>
                        На адрес <b>{email}</b> отправлено письмо со ссылкой для восстановления пароля. Перейдите по ней, чтобы установить новый пароль для учётной записи.
                    </p>
                </div>
            ) : (
                <div className={'requestResetPasswordContainer'}>
                    <KeyboardKeyTracker keys={['Enter']} onPress={() => onSubmit()} />
                    <h3>Восстановление пароля</h3>
                    <p>
                        Для восстановления пароля введите email своей учётной записи. На него будет отправлена ссылка для восстановления и вы сможете установить новый пароль.
                    </p>

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
                    >
                        Отправить
                    </Button>

                    {error[REQUEST_RESET_PASSWORD_REQUEST] && (
                        <div style={{color: 'red', marginTop: '10px', textAlign: 'center'}}>
                            {error[REQUEST_RESET_PASSWORD_REQUEST]}
                        </div>
                    )}
                </div>
            )}
            <a
                style={{
                    textDecoration: 'underline',
                    color: COLORS.DARK_BLUE,
                    fontSize: 14,
                }}
                href={'/login'}
                onClick={(e) => {
                    e.preventDefault()
                    navigate('/login')
                }}
            >
                Вернуться к форме входа
            </a>
        </div>
    )
}
