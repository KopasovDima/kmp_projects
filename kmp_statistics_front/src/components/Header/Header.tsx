import {FC} from 'react'
import KMP_logo from '../../assets/KMP_logo.png'
import {useNavigate, useSearchParams} from 'react-router'

interface IHeader {
    0?: 0
}


export const Header: FC<IHeader> = () => {
    const [searchParams] = useSearchParams()

    const navigate = useNavigate()

    if (searchParams?.get('hideHeader')) return null

    return (
        <div
            style={{
                width: 'calc(100vw - 30px)',
                height: 60,
                margin: '1rem',
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
            }}
        >
            <a
                href={'/'}
                style={{
                    flexDirection: 'row',
                    display: 'flex',
                    userSelect: 'none',
                    textDecoration: 'none',
                    color: '#111',
                }}
                onClick={(e) => {
                    e.preventDefault()
                    navigate('/')
                }}
            >
                <img src={KMP_logo} height={60} />
                <h2 style={{marginLeft: 50, fontWeight: 'normal'}}>Статистика</h2>
            </a>
        </div>
    )
}
