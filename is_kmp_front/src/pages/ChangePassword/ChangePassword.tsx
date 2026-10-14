import {useCallback, useEffect, useState} from 'react'
import {Button, Input, Typography} from 'antd'
import {useNavigate} from 'react-router'
import {useDispatch, useSelector} from 'react-redux'
import {changePasswordAction, clearErrorAction, logoutAction, setErrorAction} from '@/store/actions'
import {getAuthSelector} from '@/store/selectors'
import {getErrorSelector} from '@/store/selectors/error.ts'
import {CHANGE_PASSWORD_REQUEST} from '@/store/actionTypes'
import {KeyboardKeyTracker} from '@/components'
import './ChangePassword.css'
import {COLORS} from '@/consts'

const {Paragraph} = Typography

export const ChangePassword = () => {
    useEffect(() => {
        window.document.title = 'Смена пароля'
    }, [])

    const {changePasswordRequired} = useSelector(getAuthSelector)
    const error = useSelector(getErrorSelector)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [password, setPassword] = useState<string>('')
    const [repeatPassword, setRepeatPassword] = useState<string>('')

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
        return () => {
            clearErrorLocal()
        }
    }, [])

    const clearErrorLocal = useCallback(() => {
        if (error[CHANGE_PASSWORD_REQUEST]) dispatch(clearErrorAction(CHANGE_PASSWORD_REQUEST))
    }, [error])

    const onSubmit = async () => {
        const validationError = validateForm()
        if (validationError) {
            dispatch(setErrorAction(CHANGE_PASSWORD_REQUEST, validationError))
            return
        }

        clearErrorLocal()

        dispatch(changePasswordAction(password))
        setPassword('')
        setRepeatPassword('')
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
        <div className={'changePasswordPage'}>
            <div className={'changePasswordContainer'}>
                <KeyboardKeyTracker keys={['Enter']} onPress={() => onSubmit()}/>
                <h3>Смена пароля</h3>
                <Paragraph>
                    {changePasswordRequired ?
                        'При первом входе на сайт необходимо задать новый пароль' :
                        'Задайте новый пароль от учётной записи'
                    }
                </Paragraph>

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

                {error[CHANGE_PASSWORD_REQUEST] && (
                    <div style={{color: 'red', marginTop: '10px', textAlign: 'center'}}>
                        {error[CHANGE_PASSWORD_REQUEST]}
                    </div>
                )}

                {changePasswordRequired ? (
                    <Button
                        type={'link'}
                        onClick={() => {
                            dispatch(logoutAction())
                            navigate('/login')
                        }}
                    >
                        Выйти
                    </Button>
                ) : null}
            </div>
        </div>
    )
}
