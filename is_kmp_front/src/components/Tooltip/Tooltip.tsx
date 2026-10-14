import {FC, isValidElement, ReactElement} from 'react'
import {Tooltip as ANTDTooltip} from 'antd'
import {TooltipPlacement} from 'antd/lib/tooltip'

interface TooltipProps {
    value: string | ReactElement
    title?: string | ReactElement
    placement?: TooltipPlacement
    maxLength?: number
    showOnlyOnLargeText?: boolean
    color?: string
    textFontSize?: number
}

export const Tooltip: FC<TooltipProps> = (
    {
        value,
        title = value,
        placement = 'top',
        maxLength = 100,
        showOnlyOnLargeText = false,
        color = '',
        textFontSize = 12,
    }
) => {
    if (isValidElement(value)) {
        return (
            <ANTDTooltip
                color={color}
                title={title}
                placement={placement}
            >
                {value}
            </ANTDTooltip>
        )
    }

    return value.length > maxLength ? (
        <ANTDTooltip
            color={color}
            title={title}
            placement={placement}
            styles={{
                body: {
                    width: title.toString().length > 200 ? 800 : 400,
                },
            }}
        >
            <p style={{fontSize: textFontSize}}>{value.slice(0, maxLength - 3).trim() + '...'}</p>
        </ANTDTooltip>
    ) : showOnlyOnLargeText ? (
        <p style={{fontSize: textFontSize}}>{value}</p>
    ) : (
        <ANTDTooltip
            color={color}
            title={title}
            placement={placement}
        >
            <span style={{fontSize: textFontSize}}>{value}</span>
        </ANTDTooltip>
    )
}
