import {FC} from 'react'
import './Message.css'
import {InView} from 'react-intersection-observer'
import {Button, Flex, Image} from 'antd'
import {Tooltip, UserPhoto} from '@/components'
import {CheckOutlined, MessageOutlined} from '@ant-design/icons'
import {convertToDateString, convertToTimeString, getFileIcon} from '@/utils'

interface MessageProps {
    message: any
    isHighlighting: boolean
    authUserId?: number
    onMessageRead: () => void
    onMessageDoubleClick: () => void
    isGroupChat?: boolean
    participants?: any[]
    openPersonalChat: (userId: number) => void
    getParentMessageAndUser: () => any
    scrollToMessage: (messageId: number) => void
}

export const renderDate = (date) => {
    const currentDate = new Date()
    date = new Date(date)
    let result = ''
    if (
        date.getFullYear() !== currentDate.getFullYear() ||
        date.getMonth() !== currentDate.getMonth() ||
        date.getDate() !== currentDate.getDate()
    ) {
        result = convertToDateString(date) + ' '
    }

    return result + convertToTimeString(date)
}

const renderChatParticipantName = (participants, message, openPersonalChat) => {
    const participant = participants?.find((participant) => participant.id === message.author_id)
    const value = participant ? `${participant.first_name} ${participant.last_name}` : '-'
    return (
        <Flex vertical={false}>
            <Tooltip
                value={(
                    <b style={{fontSize: 14}}>
                        {value}
                    </b>
                )}
                title={value !== '-' ? participant.post + ' / ' + participant.company : ''}
            />
            <Tooltip
                value={(
                    <Button
                        className={'messageOpenPersonalChatButton'}
                        type={'text'}
                        onClick={() => openPersonalChat(participant.id)}
                    >
                        <MessageOutlined className={'iconPersonalChat'}/>
                    </Button>
                )}
                title={'Написать личное сообщение'}
            />
        </Flex>
    )
}

const renderParentMessage = (message, getParentMessageAndUser, scrollToMessage) => {
    if (!message.parent_message_id) return null

    const [parentMessage, user] = getParentMessageAndUser()

    if (parentMessage) {
        return (
            <div
                className={'messageParentMessageContainer'}
                onClick={() => scrollToMessage(message.parent_message_id)}
            >
                <span className={'messageParentMessageUserName'}>
                    {user?.user?.first_name + ' ' + user?.user?.last_name}
                </span>
                <div className={'messageParentMessageText'}>
                    <span>{parentMessage?.text}</span>
                    <span>
                        {!parentMessage?.text && parentMessage?.attachments?.length ?
                            'Прикреплено файлов: ' + parentMessage?.attachments?.length : ''
                        }
                    </span>
                </div>
            </div>
        )
    }
}

const renderAttachment = (attachment, renderImages: boolean = false) => {
    if (renderImages && attachment.mimetype.indexOf('image') !== -1) {
        return (
            <div key={attachment.id} className={'messageAttachmentImage'}>
                <Image
                    width={200}
                    src={attachment.url}
                    preview={{
                        mask: <div/>,
                    }}
                />
            </div>
        )
    }

    return (
        <a
            key={attachment.id}
            className={'messageAttachmentFile'}
            href={attachment.url}
            target={'_blank'}
        >
            {getFileIcon(attachment.mimetype, 'messageAttachmentFileImage')}
            <span>{attachment.filename}</span>
        </a>
    )
}

export const Message: FC<MessageProps> = (
    {
        message,
        isHighlighting,
        authUserId = 0,
        onMessageRead,
        onMessageDoubleClick,
        isGroupChat = false,
        participants,
        openPersonalChat,
        getParentMessageAndUser,
        scrollToMessage,
    }
) => {
    return (
        <InView
            id={message.id}
            as={'div'}
            onChange={(isView) => {
                if (isView && message.unread_by_current_user) onMessageRead()
            }}
            className={'messageContainer'}
            style={{
                justifyContent: message.author_id === authUserId ? 'flex-end' : 'flex-start',
                backgroundColor: isHighlighting ? 'rgba(0,0,0,0.1)' : '#00000000',
            }}
            onDoubleClick={onMessageDoubleClick}
        >
            {isGroupChat && message.author_id !== authUserId ? (
                <Flex vertical justify={'flex-end'}>
                    <UserPhoto
                        url={participants?.find((participant) => participant.id === message.author_id)?.photo}
                        onClick={() => openPersonalChat(participants?.find((participant) => participant.id === message.author_id)?.id)}
                    />
                </Flex>
            ) : null}
            <div
                className={'messageInnerContainer'}
                style={{
                    backgroundColor: (message.author_id === authUserId ? '#9adc92' : '#9fccfa') + (isHighlighting ? 'bb' : ''),
                    alignSelf: message.author_id === authUserId ? 'flex-end' : 'flex-start',
                }}
            >
                {isGroupChat && message.author_id !== authUserId ? (
                    renderChatParticipantName(participants, message, openPersonalChat)
                ) : null}
                {renderParentMessage(message, getParentMessageAndUser, scrollToMessage)}
                <pre className={'messageText'}>{message.text}</pre>
                {message.attachments?.every((attachment) => attachment.mimetype.indexOf('image') !== -1) ? (
                    <Image.PreviewGroup>
                        {message.attachments?.map((attachment) => (
                            renderAttachment(attachment, true)
                        ))}
                    </Image.PreviewGroup>
                ) : (
                    message.attachments?.map((attachment) => (
                        renderAttachment(attachment, false)
                    ))
                )}
                <div className={'messageFooterContainer'}>
                    {message.author_id === authUserId ? (
                        <div className={'messageFooterCheckmarks'}>
                            <span className={'messageFooterDate'}>
                               {renderDate(message.date)}
                            </span>
                            <Tooltip
                                color={'#ffffff'}
                                placement={'left'}
                                value={(
                                    <div className={'messageFooterCheckmarksContainer'}>
                                        <CheckOutlined className={'messageFooterFirstCheckmark'}/>
                                        {message.unread_by?.length === 0 ? (
                                            <CheckOutlined className={'messageFooterSecondCheckmark'}/>
                                        ) : null}
                                    </div>
                                )}
                                title={isGroupChat && ((participants?.length || 0) - 1) !== message?.unread_by?.length ? (
                                    <div className={'messageReadByTooltipContainer'}>
                                        <b>Прочитали:</b>
                                        {participants
                                            ?.filter(
                                                (participant) => (
                                                    participant.id !== authUserId &&
                                                    !message.unread_by?.some((up) => up === participant.id)
                                                )
                                            )?.map((participant) => (
                                                <p key={participant.id}>
                                                    {participant.first_name} {participant.last_name}
                                                </p>
                                            ))}
                                    </div>
                                ) : ''}
                            />
                        </div>
                    ) : (
                        <p>
                            {renderDate(message.date)}
                        </p>
                    )}
                </div>
            </div>
        </InView>
    )
}
