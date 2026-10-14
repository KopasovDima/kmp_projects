import {FC} from 'react'
import './Chat.css'
import {Badge, renderDate, UserPhoto} from '@/components'
import {Divider, Flex} from 'antd'

interface ChatProps {
    chat: any
    isSelected: boolean
    onSelect: () => void
    draftMessage?: any
}

export const Chat: FC<ChatProps> = (
    {
        chat,
        isSelected,
        onSelect,
        draftMessage = '',
    }
) => {
    return (
        <div className={'chatContainer'}>
            <Badge
                value={chat.unread_count}
                xOffset={14}
                yOffset={38}
                centeredContent={false}
            >
                <Flex
                    vertical={false}
                    style={{
                        width: '100%',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#e6f4ff' : 'transparent',
                    }}
                    onClick={onSelect}
                >
                    {!chat.is_group ? (
                        <UserPhoto url={chat.chat_photo}/>
                    ) : null}
                    <div
                        className={'chatInnerContainer'}
                        style={{
                            paddingLeft: chat.is_group ? 10 : 4,
                            paddingRight: 10,
                            width: chat.is_group ? 248 : 198,
                        }}
                    >
                        <div className={'chatName'}>
                            <b>{chat.chat_name}</b>
                        </div>
                        {chat.is_group ? <p> (групповой чат)</p> : null}
                        {chat.last_message_date && renderDate ? (
                            <p className={'chatLastMessageDate'}>{renderDate(chat.last_message_date)}</p>
                        ) : null}
                        {chat.last_message ? (
                            <p className={'chatLastMessage'}>
                                {draftMessage ? <><b style={{color: 'red'}}>Черновик</b><br/></> : null}
                                {draftMessage || chat.last_message}
                            </p>
                        ) : <p>пустой чат</p>}
                    </div>
                </Flex>
            </Badge>
            <Divider className={'chatDivider'}/>
        </div>
    )
}
