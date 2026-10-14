import {FC, useEffect} from 'react'
import './ITLandscape.css'
import {Home} from '@/pages'

export const ITLandscape: FC = () => {
    useEffect(() => {
        window.document.title = 'ИТ ландшафт'
    }, [])

    return <Home />
}
