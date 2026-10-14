import {FC, useCallback, useEffect, useRef, useState} from 'react'
import {Flex, Typography} from 'antd'
import {useNavigate} from 'react-router'
import {useDispatch, useSelector} from 'react-redux'
import {getAuthSelector} from '@/store/selectors'
import {attachUserProfilePhotoAction, getAuthUserInfoAction} from '@/store/actions'
import './UserProfile.css'
import {EditOutlined, UserOutlined} from '@ant-design/icons'
import {Tooltip} from '@/components'

const {Paragraph, Title} = Typography

export const UserProfile: FC = () => {
    const navigate = useNavigate()

    const {userInfo, isLoggedIn} = useSelector(getAuthSelector)
    const dispatch = useDispatch()
    const [displayChangeProfilePhoto, setDisplayChangeProfilePhoto] = useState<boolean>(false)

    const photoInputRef = useRef<any>(null)

    useEffect(() => {
        window.document.title = 'Профиль'
        dispatch(getAuthUserInfoAction())
    }, [])

    useEffect(() => {
        if (userInfo) window.document.title = `Профиль - ${userInfo?.first_name} ${userInfo?.last_name}`
    }, [userInfo])

    useEffect(() => {
        if (!isLoggedIn) navigate('/')
    })

    const handleFileChange = useCallback((e) => {
        const file = e?.target?.files?.[0]

        if (!file) return

        if (file.type.indexOf('image/') === -1) return

        dispatch(attachUserProfilePhotoAction(file))
    }, [])

    const triggerPhotoSelect = () => {
        photoInputRef!.current!.click()
    }

    if (!userInfo) return null

    return (
        <Flex className={'userProfile'} vertical>
            <Title level={4}>Профиль пользователя</Title>
            <Tooltip
                value={(
                    <div
                        className={'userProfilePhotoContainer'}
                        onClick={triggerPhotoSelect}
                        onMouseEnter={() => setDisplayChangeProfilePhoto(true)}
                        onMouseLeave={() => setDisplayChangeProfilePhoto(false)}
                    >
                        <input
                            className={'userProfilePhotoInput'}
                            type={'file'}
                            ref={photoInputRef}
                            onChange={handleFileChange}
                            accept={'image/*'}
                        />
                        {userInfo?.photo ? (
                            <img
                                className={'userProfilePhoto'}
                                src={userInfo?.photo}
                                style={{
                                    opacity: displayChangeProfilePhoto ? 0.7 : 1,
                                }}
                            />
                        ) : (
                            <UserOutlined
                                className={'userProfilePhotoPlaceholder'}
                                style={{
                                    opacity: displayChangeProfilePhoto ? 0 : 1,
                                }}
                            />
                        )}
                        {displayChangeProfilePhoto ? (
                            <Flex vertical justify={'center'} className={'userProfilePhotoUpdateContainer'}>
                                <EditOutlined className={'userProfilePhotoUpdate'}/>
                            </Flex>
                        ) : null}
                    </div>
                )}
                title={'Заменить фотографию профиля (рекомендуемый размер изображения 300*300 пикселей)'}
            />
            <Flex
                vertical={false}
                justify={'space-between'}
                className={'userProfilePropertyContainer'}
            >
                <Paragraph className={'userProfilePropertyTitle'}>ID:</Paragraph>
                <span className={'userProfilePropertyValue'}>{userInfo.user_id}</span>
            </Flex>
            <Flex
                vertical={false}
                justify={'space-between'}
                className={'userProfilePropertyContainer'}
            >
                <Paragraph className={'userProfilePropertyTitle'}>Логин:</Paragraph>
                <span className={'userProfilePropertyValue'}>{userInfo.user_name}</span>
            </Flex>
            <Flex
                vertical={false}
                justify={'space-between'}
                className={'userProfilePropertyContainer'}
            >
                <Paragraph className={'userProfilePropertyTitle'}>Имя:</Paragraph>
                <span className={'userProfilePropertyValue'}>{userInfo.first_name}</span>
            </Flex>
            <Flex
                vertical={false}
                justify={'space-between'}
                className={'userProfilePropertyContainer'}
            >
                <Paragraph className={'userProfilePropertyTitle'}>Фамилия:</Paragraph>
                <span className={'userProfilePropertyValue'}>{userInfo.last_name}</span>
            </Flex>
            <Flex
                vertical={false}
                justify={'space-between'}
                className={'userProfilePropertyContainer'}
            >
                <Paragraph className={'userProfilePropertyTitle'}>Email:</Paragraph>
                <span className={'userProfilePropertyValue'}>{userInfo.email}</span>
            </Flex>
            <Flex
                vertical={false}
                justify={'space-between'}
                className={'userProfilePropertyContainer'}
            >
                <Paragraph className={'userProfilePropertyTitle'}>Компания:</Paragraph>
                <span className={'userProfilePropertyValue'}>
                    {userInfo.company?.id ? `${userInfo.company?.name} (${userInfo.company?.short_name})` : 'Отсутствует'}
                </span>
            </Flex>
            <Flex
                vertical={false}
                justify={'space-between'}
                className={'userProfilePropertyContainer'}
            >
                <Paragraph className={'userProfilePropertyTitle'}>Роли:</Paragraph>
                <div className={'userProfilePropertyValue'}>
                    {userInfo.roles?.length ? userInfo.roles?.map((userRole) => (
                        <p key={userRole.id}>{userRole.name}</p>
                    )) : <span>Нет назначенных ролей</span>}
                </div>
            </Flex>
        </Flex>
    )
}