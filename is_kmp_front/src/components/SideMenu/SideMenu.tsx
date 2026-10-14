import {useSelector} from 'react-redux'
import {getAuthSelector, getChatsSelector, getOffersSelector} from '@/store/selectors'
import './SideMenu.css'
import {Layout, Menu} from 'antd'
import {useLocation, useNavigate} from 'react-router'
import {useEffect, useRef, useState} from 'react'
import {Badge} from '@/components'
import Icon, {
    ApartmentOutlined,
    CalculatorOutlined,
    CodeOutlined,
    FundOutlined,
    HddOutlined,
    MessageOutlined,
    PieChartOutlined,
    ProjectOutlined,
    ReadOutlined,
    ScheduleOutlined
} from '@ant-design/icons'
import OfferIcon from '@/assets/icons/offer-icon.svg?react'
import OrderIcon from '@/assets/icons/order-icon.svg?react'

const {Sider} = Layout

const pathToIndex = (path: string) => {
    if (!path) return ''
    if (path === '/') return 'it-landscape'
    return path.split('/')[1]
}

export const SideMenu = () => {
    const {isLoggedIn} = useSelector(getAuthSelector)
    const ref = useRef<any>(null)

    const {unreadChatsCount} = useSelector(getChatsSelector)
    const {unreadCommentsCount} = useSelector(getOffersSelector)

    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<string>(pathToIndex(window.location.pathname))

    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const newPageUrl = pathToIndex(window.location.pathname)
        if (newPageUrl !== selectedItem) {
            setSelectedItem(newPageUrl)
            setIsSideMenuOpen(false)
        }
    }, [location])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsSideMenuOpen(false)
            }
        };

        if (isSideMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSideMenuOpen]);

    if (!isLoggedIn) return null

    return (
        <Sider
            ref={ref}
            className={'siderContainer'}
            theme={'light'}
            collapsed={!isSideMenuOpen}
            onCollapse={() => {
                setIsSideMenuOpen(!isSideMenuOpen)
            }}
            collapsible
            defaultCollapsed
            collapsedWidth={60}
            width={400}
        >
            <Menu
                style={{
                    width: isSideMenuOpen ? 400 : 60,
                    borderWidth: 0,
                }}
                mode={'inline'}
                defaultSelectedKeys={[selectedItem]}
                selectedKeys={[selectedItem]}
                onClick={(value) => value.key !== selectedItem ? navigate(value.key) : null}
                items={[
                    {
                        key: 'business-functions',
                        icon: <ReadOutlined/>,
                        label: 'Бизнес-функции',
                    },
                    {
                        key: 'messages',
                        icon: (
                            <Badge
                                value={unreadChatsCount}
                                xOffset={-14}
                                yOffset={2}
                            >
                                <MessageOutlined/>
                            </Badge>
                        ),
                        label: 'Сообщения'
                    },
                    {
                        key: 'events',
                        icon: <ScheduleOutlined/>,
                        label: 'Мероприятия',
                    },
                    {
                        key: 'offers',
                        icon: (
                            <Badge
                                value={unreadCommentsCount}
                                xOffset={-14}
                                yOffset={2}
                            >
                                <Icon
                                    className={'iconSideMenuOffers'}
                                    component={OfferIcon}
                                />
                            </Badge>
                        ),
                        label: 'Предложения',
                    },
                    {
                        key: 'it-landscape',
                        icon: <ApartmentOutlined/>,
                        label: 'ИТ-ландшафт',
                    },
                    {
                        key: 'orders',
                        icon: (
                            <Icon
                                className={'iconSideMenuOrders'}
                                component={OrderIcon}
                            />
                        ),
                        label: 'Обязательные указания',
                    },
                    {
                        key: 'budget',
                        icon: <CalculatorOutlined/>,
                        label: 'Бюджет',
                    },
                    {
                        key: 'it-projects',
                        icon: <FundOutlined/>,
                        label: 'ИТ Проекты',
                    },
                    {
                        key: 'purchases',
                        icon: <ProjectOutlined/>,
                        label: 'Закупки',
                    },
                    {
                        key: 'reports',
                        icon: <PieChartOutlined/>,
                        label: 'Отчёты',
                    },
                    {
                        key: 'infrastructure',
                        icon: <HddOutlined/>,
                        label: 'Инфраструктура',
                    },
                    {
                        key: 'digital',
                        icon: <CodeOutlined/>,
                        label: 'Цифровая зрелость',
                    },
                ]}
            />
        </Sider>
    )
}
