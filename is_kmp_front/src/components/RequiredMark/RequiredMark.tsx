import {FC} from 'react'

interface RequiredMark {
    0?: any
}

export const RequiredMark: FC<RequiredMark> = () => {
    return (
        <span
            style={{
                color: '#b00b14',
                fontWeight: 'bold',
            }}
        >
            *
        </span>
    )
}
