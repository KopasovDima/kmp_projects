import {FC, ReactNode} from 'react'
import './Badge.css'

interface BadgeProps {
    value: number
    children?: ReactNode
    xOffset?: number
    yOffset?: number
    centeredContent?: boolean
}

export const Badge: FC<BadgeProps> = (
    {
        value,
        children,
        xOffset = 0,
        yOffset = 0,
        centeredContent = true
    }
) => {
    return (
        <div className={`badgeContainer ${centeredContent ? 'badgeContainerCentered' : ''}`}>
            {value ? (
                <div
                    className={'badgeTextContainer'}
                    style={{
                        top: yOffset,
                        right: xOffset,
                    }}
                >
                    <span>{value}</span>
                </div>
            ) : null}
            {children}
        </div>
    )
}
