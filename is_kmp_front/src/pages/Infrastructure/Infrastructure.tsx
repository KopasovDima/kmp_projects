import {FC, useEffect} from 'react'
import './Infrastructure.css'

export const Infrastructure: FC = () => {
    useEffect(() => {
        window.document.title = 'Инфраструктура'
    }, [])

    return (
        <div className={'infrastructurePage'}>
            Инфраструктура
        </div>
    )
}
