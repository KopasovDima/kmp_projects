import {FC, useEffect} from 'react'
import './Reports.css'

export const Reports: FC = () => {
    useEffect(() => {
        window.document.title = 'Отчёты'
    }, [])

    return (
        <div className={'reportsPage'}>
            Отчёты
        </div>
    )
}
