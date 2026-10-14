import './App.css'
import {
    Budget,
    BusinessFunctions,
    ChangePassword,
    Digital,
    DjangoAdmin,
    Events,
    Home,
    Infrastructure,
    ITLandscape,
    ITProjects,
    Login,
    Login2FA,
    Messages,
    Offers,
    Orders,
    Purchases,
    Reports,
    RequestResetPassword,
    ResetPassword,
    Settings,
    UserProfile
} from '@/pages'
import {Header, NotificationsProvider, SideMenu} from '@/components'
import {ConfirmationDialogModal} from '@/modals'
import {BrowserRouter, Navigate, Route, Routes, useLocation} from 'react-router'
import {Flex, Layout} from 'antd'
import {useEffect} from 'react'
import {getAuthToken, getRefreshToken} from '@/utils'
import {useDispatch, useSelector} from 'react-redux'
import {
    checkAuthAction,
    getAvailableCompaniesAction,
    getUnreadChatsCountAction,
    getUnreadOffersCountAction,
    refreshTokenAction,
    setIsLoggedInAction,
    setIsOnlineAction
} from '@/store/actions'
import {getAuthSelector} from '@/store/selectors'
import {CHECK_TOKEN_EXPIRED_INTERVAL_MS} from '@/consts'
import {jwtDecode} from 'jwt-decode'
import {chatsListWS, createChatsListWS, createOffersListWS, offersListWS} from '@/services/websockets.ts'
import secureLocalStorage from 'react-secure-storage'
import {useUserActivity} from '@/hooks'


const Redirect = (
    {
        to,
    }: {
        to: string
    }
) => {
    const location = useLocation()
    const {isLoggedIn} = useSelector(getAuthSelector)

    if (!isLoggedIn) {
        secureLocalStorage.setItem('redirectAfterSuccessLogin', location.pathname)
    }

    return <Navigate to={to}/>
}

function App() {
    const {isOnline} = useUserActivity()
    const dispatch = useDispatch()
    const {isLoggedIn, userInfo, lastLoggedInUpdate, changePasswordRequired} = useSelector(getAuthSelector)

    useEffect(() => {
        dispatch(setIsOnlineAction(isOnline))
    }, [isOnline])

    useEffect(() => {
        if (getAuthToken()) dispatch(checkAuthAction())
        else if (getRefreshToken()) dispatch(refreshTokenAction(checkAuthAction()))
        else dispatch(setIsLoggedInAction(false))

        setInterval(() => {
            if (!getAuthToken()) return
            const payload: any = jwtDecode(getAuthToken()?.toString() || '')
            const expireDate = new Date(payload!.exp * 1000 - CHECK_TOKEN_EXPIRED_INTERVAL_MS * 2)
            const currentDate = new Date()

            if (expireDate < currentDate) {
                dispatch(refreshTokenAction())
            }
        }, CHECK_TOKEN_EXPIRED_INTERVAL_MS)
    }, [])

    useEffect(() => {
        if (isLoggedIn) {
            dispatch(getUnreadChatsCountAction())
            dispatch(getUnreadOffersCountAction())
            const redirectAfterSuccessLogin = secureLocalStorage.getItem('redirectAfterSuccessLogin')
            if (redirectAfterSuccessLogin) {
                secureLocalStorage.removeItem('redirectAfterSuccessLogin')
                window.location.replace(redirectAfterSuccessLogin as string)
            }
            dispatch(getAvailableCompaniesAction())
        }
    }, [isLoggedIn])

    useEffect(() => {
        chatsListWS?.close()
        offersListWS?.close()
        if (lastLoggedInUpdate && userInfo?.user_id) {
            createChatsListWS(userInfo?.user_id, dispatch)
            createOffersListWS(userInfo?.user_id, dispatch)
        }
    }, [userInfo, lastLoggedInUpdate])

    if (
        ((isLoggedIn === undefined) && !changePasswordRequired) ||
        isLoggedIn && !userInfo?.user_id
    ) return null

    return (
        <BrowserRouter>
            <Header/>
            <ConfirmationDialogModal/>
            <NotificationsProvider/>
            <Layout hasSider>
                <SideMenu/>
                {isLoggedIn ? (
                    <Flex vertical className={'routes'}>
                        <Routes>
                            <Route path={'/'} element={<Home/>}/>
                            <Route path={'/profile'} element={<UserProfile/>}/>
                            <Route path={'/messages'} element={<Messages/>}/>
                            <Route path={'/events'} element={<Events/>}/>
                            <Route path={'/offers'} element={<Offers/>}/>
                            <Route path={'/orders'} element={<Orders/>}/>
                            <Route path={'/it-landscape'} element={<ITLandscape/>}/>
                            <Route path={'/budget'} element={<Budget/>}/>
                            <Route path={'/it-projects'} element={<ITProjects/>}/>
                            <Route path={'/purchases'} element={<Purchases/>}/>
                            <Route path={'/reports'} element={<Reports/>}/>
                            <Route path={'/infrastructure'} element={<Infrastructure/>}/>
                            <Route path={'/digital'} element={<Digital/>}/>
                            <Route path={'/settings'} element={<Settings/>}/>
                            <Route path={'/business-functions'} element={<BusinessFunctions/>}/>
                            <Route path={'/change-password'} element={<ChangePassword/>}/>

                            {/* Админка */}
                            <Route path={'/auth_admin'} element={<DjangoAdmin/>}/>
                            <Route path={'/admin'} element={<DjangoAdmin/>}/>

                            {/* Редирект на главную для неизвестного адреса */}
                            <Route path={'*'} element={<Redirect to={'/'}/>}/>
                        </Routes>
                    </Flex>
                ) : getAuthToken() ? (
                    <Routes>
                        <Route path={'/change-password-required'} element={<ChangePassword/>}/>

                        {/* Админка */}
                        <Route path={'/auth_admin'} element={<DjangoAdmin/>}/>
                        <Route path={'/admin'} element={<DjangoAdmin/>}/>

                        {/* Редирект на главную для неизвестного адреса */}
                        <Route path={'*'} element={<Redirect to={'/change-password-required'}/>}/>
                    </Routes>
                ) : (
                    <Routes>
                        <Route path={'/login'} element={<Login/>}/>
                        <Route path={'/login-2fa'} element={<Login2FA/>}/>
                        <Route path={'/request-reset-password'} element={<RequestResetPassword/>}/>
                        <Route path={'/reset-password/:resetPasswordToken'} element={<ResetPassword/>}/>

                        {/* Админка */}
                        <Route path={'/auth_admin'} element={<DjangoAdmin/>}/>
                        <Route path={'/admin'} element={<DjangoAdmin/>}/>

                        {/* Редирект на страницу авторизации для неизвестного адреса */}
                        <Route path={'*'} element={<Redirect to={'/login'}/>}/>
                    </Routes>
                )}
            </Layout>
        </BrowserRouter>
    )
}

export default App
