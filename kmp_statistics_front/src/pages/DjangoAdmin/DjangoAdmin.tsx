import {FC} from 'react'
import {ENV} from '@/consts'

export const DjangoAdmin: FC = () => {
    window.location.replace(ENV.SERVER_URL + '/admin')
    return null
}
