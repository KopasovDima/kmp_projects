import {FC} from 'react'
import './HintTooltip.css'
import {Tooltip} from '@/components'
import {QuestionCircleOutlined} from '@ant-design/icons'

interface HintTooltipProps {
    hintText: string
}

export const HintTooltip: FC<HintTooltipProps> = (
    {
        hintText = '',
    }
) => {
    return (
        <Tooltip
            value={<QuestionCircleOutlined className={'hintTooltipIcon'}/>}
            title={<pre>{hintText}</pre>}
            placement={'left'}
        />
    )
}
