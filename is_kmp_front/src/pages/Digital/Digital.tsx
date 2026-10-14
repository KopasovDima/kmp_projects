import {FC, useEffect} from 'react'
import './Digital.css'

export const Digital: FC = () => {
    useEffect(() => {
        window.document.title = 'Цифровая зрелость'
    }, [])

    return (
        <div className={'digitalPage'}>
            Цифровая зрелость
        </div>
    )
}
