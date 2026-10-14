import {useCallback, useEffect, useState} from 'react'
import {Button, Input, Typography} from 'antd'
import {useNavigate, useParams} from 'react-router'
import {useDispatch, useSelector} from 'react-redux'
import {clearErrorAction, resetPasswordAction, setErrorAction} from '@/store/actions'
import {getAuthSelector} from '@/store/selectors'
import {getErrorSelector} from '@/store/selectors/error.ts'
import {RESET_PASSWORD_REQUEST} from '@/store/actionTypes'
import {KeyboardKeyTracker} from '@/components'
import './ResetPassword.css'
import {COLORS} from '@/consts'
import {jwtDecode} from 'jwt-decode'

const {Paragraph} = Typography

export const ResetPassword = () => {
    useEffect(() => {
        window.document.title = 'Восстановление пароля'
    }, [])

    const navigate = useNavigate()
    const { isLoggedIn } = useSelector(getAuthSelector)
    const error = useSelector(getErrorSelector)
    const dispatch = useDispatch()

    const params = useParams()

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [repeatPassword, setRepeatPassword] = useState<string>('')
    const [resetSuccess, setResetSuccess] = useState<boolean>(false)

    const validatePassword = (p: string) => {
        const errorMessage = 'Недостаточно надёжный пароль. Пароль должен быть не менее 8 символов, включать буквы в нижнем и верхнем регистре, содержать цифры и спец символы (~!?@#$%^&*_-+()[]{}><\\/|"\':.,)'

        if (p.length < 8) {
            return errorMessage
        }

        if (!/[a-z]/.test(p)) {
            return errorMessage
        }

        if (!/[A-Z]/.test(p)) {
            return errorMessage
        }

        if (!/\d/.test(p)) {
            return errorMessage
        }

        const specialChars = /[~!?@#$%^&*_\-+()\[\]{}><\/\\|"':.,]/
        if (!specialChars.test(p)) {
            return errorMessage
        }

        return ''
    }

    const validateForm = () => {
        if (!password || !repeatPassword) {
            return 'Введите пароль'
        }

        if (password !== repeatPassword) {
            return 'Пароли должны совпадать'
        }

        return validatePassword(password)
    }
    
    useEffect(() => {
        if (isLoggedIn) navigate('/')
    })

    useEffect(() => {
        if (!params.resetPasswordToken) navigate('/login')
        else {
            try {
                const jwtPayload = jwtDecode(params.resetPasswordToken)

                const email = (jwtPayload as any).email

                if (!email) navigate('/')

                setEmail(email)
            } catch (_) {
                navigate('/login')
            }
        }
    }, [params])

    useEffect(() => {
        return () => {
            clearErrorLocal()
        }
    }, [])

    const clearErrorLocal = useCallback(() => {
        if (error[RESET_PASSWORD_REQUEST]) dispatch(clearErrorAction(RESET_PASSWORD_REQUEST))
        setResetSuccess(false)
    }, [error])

    const onSubmit = async () => {
        const validationError = validateForm()
        if (validationError) {
            dispatch(setErrorAction(RESET_PASSWORD_REQUEST, validationError))
            return
        }

        clearErrorLocal()

        dispatch(resetPasswordAction(password, params.resetPasswordToken || '', () => setResetSuccess(true)))
    }

    const onInputPassword = (e: any) => {
        setPassword(e.target.value)
        clearErrorLocal()
    }

    const onInputRepeatPassword = (e: any) => {
        setRepeatPassword(e.target.value)
        clearErrorLocal()
    }

    return (
        <div
            className={'resetPasswordPage'}
            style={{
                background: COLORS.PALE_BLUE,
            }}
        >
            {resetSuccess && !error[RESET_PASSWORD_REQUEST] ? (
                <div className={'resetPasswordContainer'}>
                    <h3>Восстановление пароля</h3>
                    <p>
                        Пароль успешно изменён, используйте его для входа в свою учётную запись.
                    </p>
                </div>
            ) : (
                <div className={'resetPasswordContainer'}>
                    <KeyboardKeyTracker keys={['Enter']} onPress={() => onSubmit()} />
                    <h3>Восстановление пароля</h3>
                    <p>
                        Задайте новый пароль для учётной записи <b>{email}</b>.
                    </p>

                    <div style={{marginBottom: '15px'}}>
                        <Paragraph
                            style={{
                                margin: 8,
                                textAlign: 'left',
                            }}
                        >
                            Новый пароль
                        </Paragraph>
                        <Input
                            placeholder={'Введите новый пароль'}
                            type={'password'}
                            onChange={onInputPassword}
                            value={password}
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
                            Повторите новый пароль
                        </Paragraph>
                        <Input
                            placeholder={'Введите новый пароль ещё раз'}
                            type={'password'}
                            onChange={onInputRepeatPassword}
                            value={repeatPassword}
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

                    {error[RESET_PASSWORD_REQUEST] && (
                        <div style={{color: 'red', marginTop: '10px', textAlign: 'center'}}>
                            {error[RESET_PASSWORD_REQUEST]}
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
