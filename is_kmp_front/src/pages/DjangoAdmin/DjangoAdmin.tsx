import {FC} from 'react'
import {ENV} from '@/consts'

export const DjangoAdmin: FC = () => {
    window.location.replace((window.location.pathname === '/admin' ? ENV.SERVER_URL : ENV.AUTH_SERVER_URL) + '/admin')
    return null
}
