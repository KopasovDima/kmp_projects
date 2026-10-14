import {FC, useEffect, useState} from 'react'
import {useNavigate} from 'react-router'
import {Button, Divider, Flex, Modal, Popover} from 'antd'
import {useDispatch, useSelector} from 'react-redux'
import {getAuthSelector, getCompaniesSelector} from '@/store/selectors'
import {logoutAction, openConfirmationDialogAction, selectChildCompanyAction} from '@/store/actions'
import {checkAdmin} from '@/utils'
import './Header.css'
import secureLocalStorage from 'react-secure-storage'
import {SelectCompany, UserPhoto} from '@/components'
import {ENV} from '@/consts'

interface HeaderProps {
    0?: 0
}

export const Header: FC<HeaderProps> = () => {
    const navigate = useNavigate()
    const {isLoggedIn, userInfo, userSelectedChildCompany, changePasswordRequired} = useSelector(getAuthSelector)
    const {availableCompanies} = useSelector(getCompaniesSelector)
    const dispatch = useDispatch()

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [headerLink, setHeaderLink] = useState<string>(isLoggedIn ? '/' : '/login')

    useEffect(() => {
        setHeaderLink(isLoggedIn ? '/' : '/login')
    }, [isLoggedIn])

    useEffect(() => {
        if (changePasswordRequired) {
            navigate('/change-password-required')
        }
    }, [changePasswordRequired])

    return (
        <Flex
            vertical
            className={'headerContainer'}
        >
            {!ENV.IS_PRODUCTION ? (
                <div className={'headerTestServerInfo'}>
                    <span>
                        Это тестовый сервер.
                        {' '}
                        Адрес прод-сервера
                        {' - '}
                        <a
                            target={'_blank'}
                            className={'headerProdServerLink'}
                            href={'https://iskmp.aokmp.ru'}
                        >
                            https://iskmp.aokmp.ru
                        </a>
                    </span>
                </div>
            ) : null}
            <div className={'headerMainContainer'}>
                <a
                    href={headerLink}
                    className={'headerLink'}
                    onClick={(e) => {
                        if (!(e.target as any).className) return
                        e.preventDefault()
                        navigate(headerLink)
                    }}
                >
                    <h4 className={'headerLinkText'}>
                        {isLoggedIn || changePasswordRequired ? (
                            <Flex vertical={false}>
                                Личный кабинет
                                {userInfo?.company?.short_name ? (
                                    <Popover
                                        arrow={false}
                                        placement={'bottomRight'}
                                        content={availableCompanies?.length > 1 ? (
                                            <SelectCompany
                                                userCompanyId={userInfo.company.id}
                                                selectedCompanyId={userSelectedChildCompany?.id || userInfo.company.id}
                                                onCompanySelect={(company) => {
                                                    if (company.id !== userInfo.company.id) {
                                                        if (userSelectedChildCompany?.id === company.id) return
                                                        dispatch(selectChildCompanyAction(company))
                                                        secureLocalStorage.setItem('userSelectedChildCompany', company)
                                                    } else {
                                                        dispatch(selectChildCompanyAction(undefined))
                                                        secureLocalStorage.removeItem('userSelectedChildCompany')
                                                    }
                                                }}
                                            />
                                        ) : null}
                                    >
                                        <div
                                            style={{
                                                textDecoration: availableCompanies?.length > 1 ? 'underline' : 'none',
                                                marginLeft: 10
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                            }}
                                        >
                                            {userInfo?.company?.short_name}
                                            {userSelectedChildCompany ? ` (работа от лица ${userSelectedChildCompany.short_name})` : null}
                                        </div>
                                    </Popover>
                                ) : null}
                            </Flex>
                        ) : 'Личный кабинет - Авторизация'}
                    </h4>
                </a>

                {isLoggedIn ? (
                    <>
                        <UserPhoto
                            url={userInfo?.photo}
                            onClick={() => setIsModalOpen(true)}
                        />
                        <Modal
                            className={'headerUserProfileModal'}
                            open={isModalOpen}
                            width={'fit-content'}
                            onCancel={() => setIsModalOpen(false)}
                            cancelText={''}
                            okText={''}
                            closable={false}
                            mask={false}
                            classNames={{
                                content: 'headerUserProfileModalContent',
                                footer: 'headerUserProfileModalFooter',
                                header: 'headerUserProfileModalFooter',
                            }}
                        >
                            <Flex vertical>
                                <Button
                                    type={'link'}
                                    onClick={() => {
                                        setIsModalOpen(false)
                                        navigate('/profile')
                                    }}
                                >
                                    {(userInfo?.first_name + ' ' + userInfo?.last_name).trim() || 'Профиль'}
                                </Button>
                                <Button
                                    type={'link'}
                                    onClick={() => {
                                        setIsModalOpen(false)
                                        navigate('/settings')
                                    }}
                                >
                                    Настройки
                                </Button>
                                <Button
                                    type={'link'}
                                    onClick={() => {
                                        setIsModalOpen(false)
                                        navigate('/change-password')
                                    }}
                                >
                                    Сменить пароль
                                </Button>
                                <Button
                                    type={'link'}
                                    onClick={() => {
                                        dispatch(openConfirmationDialogAction({
                                            title: 'Выйти?',
                                            onApply: () => {
                                                setIsModalOpen(false)
                                                dispatch(logoutAction())
                                            },
                                            applyText: 'Да',
                                        }))
                                    }}
                                >
                                    Выйти
                                </Button>
                                {checkAdmin(userInfo?.roles) ? (
                                    <>
                                        <Divider className={'headerUserProfileModalDivider'} size={'small'}/>
                                        <a className={'headerUserProfileModalLink'} href={'/admin'}>
                                            <Button
                                                type={'link'}
                                                onClick={() => {
                                                    setIsModalOpen(false)
                                                    navigate('/admin')
                                                }}
                                            >
                                                Админка
                                            </Button>
                                        </a>
                                        <a className={'headerUserProfileModalLink'} href={'/auth_admin'}>
                                            <Button
                                                type={'link'}
                                                onClick={() => {
                                                    setIsModalOpen(false)
                                                    navigate('/auth_admin')
                                                }}
                                            >
                                                Auth-Админка
                                            </Button>
                                        </a>
                                    </>
                                ) : null}
                            </Flex>
                        </Modal>
                    </>
                ) : null}
            </div>
        </Flex>
    )
}
