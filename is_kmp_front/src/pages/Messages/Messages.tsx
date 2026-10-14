import {FC, useCallback, useEffect, useRef, useState} from 'react'
import './Messages.css'
import {useDispatch, useSelector} from 'react-redux'
import {
    addChatParticipantAction,
    createGroupChatAction,
    createPersonalChatAction,
    deleteGroupChatAction,
    findPersonalChatAction,
    getChatMessagesAction,
    getChatParticipantsAction,
    getChatsAction,
    getUserProfilesAction,
    openConfirmationDialogAction,
    readMessageAction,
    removeChatParticipantAction,
    sendMessageAction,
    updateGroupChatAction
} from '@/store/actions'
import {Button, Divider, Dropdown, Flex, Input} from 'antd'
import {getAuthSelector, getChatsSelector} from '@/store/selectors'
import {ArrowDownOutlined, DeleteOutlined, EditOutlined, MoreOutlined} from '@ant-design/icons'
import {Badge, Chat, Message, MessageInput, UserPhoto} from '@/components'
import {GroupChatModal, GroupChatParticipantsModal} from '@/modals'
import {chatMessagesWS, createChatMessagesWS} from '@/services'
import secureLocalStorage from 'react-secure-storage'
import {InView} from 'react-intersection-observer'

const getUserProfileByUserId = (userProfiles: any[], userId: number) => {
    return userProfiles?.find(userProfile => userProfile.user?.id === userId)
}

const getUserProfileByUserName = (userProfiles: any[], userName: string) => {
    return userProfiles?.find(userProfile => userProfile.user?.first_name + ' ' + userProfile.user?.last_name === userName)
}

const renderUserPostAndCompanyName = (userProfiles: any[], userId: number | undefined, userName: string | undefined) => {
    const user = userId ?
        getUserProfileByUserId(userProfiles, userId) :
        userName ? getUserProfileByUserName(userProfiles, userName) : {}
    return (
        <span className={'messagesChatNameUserPost'}>{' '}({user?.post} / {user?.company?.short_name})</span>
    )
}

export const Messages: FC = () => {
    const [selectedChat, setSelectedChat] = useState<any>(undefined)
    const [selectedChatName, setSelectedChatName] = useState<string>('')
    const [selectedChatPhoto, setSelectedChatPhoto] = useState<string>('')
    const [searchChatsText, setSearchChatsText] = useState<string>('')

    const [updatingGroupChat, setUpgradingGroupChat] = useState<any>(undefined)
    const [newPersonalChatUserId, setNewPersonalChatUserId] = useState<any>(undefined)
    const [openCreatedChat, setOpenCreatedChat] = useState<boolean>(false)
    const [highlightScrolledMessage, setHighlightScrolledMessage] = useState<any>(undefined)
    const [highlightScrolledMessageTimeout, setHighlightScrolledMessageTimeout] = useState<any>(undefined)
    const [lastMessageBeforeNewMessage, setLastMessageBeforeNewMessage] = useState<any>(undefined)
    const [scrollToLastReadMessage, setScrollToLastReadMessage] = useState<boolean>(false)
    const [isChatBottomVisible, setIsChatBottomVisible] = useState<boolean>(true)

    const [messageInput, setMessageInput] = useState<string>('')
    const [selectedFiles, setSelectedFiles] = useState<any[]>([])
    const [selectedParentMessage, setSelectedParentMessage] = useState<any>(undefined)

    const [findPersonalChatWithUser, setFindPersonalChatWithUser] = useState<number | undefined>(undefined)

    const [isCreateChatModalOpen, setIsCreateChatModalOpen] = useState<boolean>(false)
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState<boolean>(false)

    const messagesContainerRef = useRef<any>(undefined)

    const dispatch = useDispatch()

    const openPersonalChatWithUser = secureLocalStorage.getItem('openPersonalChatWithUser')

    const {
        chats,
        messages,
        lastReadMessageId,
        participants,
        userProfiles,
        findPersonalChat
    } = useSelector(getChatsSelector)
    const {userInfo, lastLoggedInUpdate, isOnline} = useSelector(getAuthSelector)

    useEffect(() => {
        window.document.title = 'Сообщения'
        secureLocalStorage.removeItem('chatsSearchText')
        dispatch(getChatsAction())
        if (!userProfiles?.length) dispatch(getUserProfilesAction(true))
    }, [])

    useEffect(() => {
        if (selectedChat) {
            setMessageInput((secureLocalStorage.getItem(`chat${selectedChat.id}`) || '') as string)
            const localStorageSelectedParentMessage = secureLocalStorage.getItem(`chat${selectedChat.id}SelectedParentMessage`)
            if (localStorageSelectedParentMessage)
                setSelectedParentMessage(JSON.parse(localStorageSelectedParentMessage as string))
            dispatch(getChatMessagesAction(selectedChat.id, false))
            setSelectedFiles([])
            setSelectedChatName(selectedChat.chat_name)
            setSelectedChatPhoto(selectedChat.chat_photo)
            if (selectedChat?.is_group) dispatch(getChatParticipantsAction(selectedChat?.id, true))
            setScrollToLastReadMessage(true)
            setIsChatBottomVisible(true)
        }
    }, [selectedChat])

    useEffect(() => {
        if (lastMessageBeforeNewMessage && !!messages?.[0]?.id && messages?.[0]?.id !== lastMessageBeforeNewMessage) {
            scrollToTop()
            setLastMessageBeforeNewMessage(undefined)
        }
    }, [messages, lastMessageBeforeNewMessage])

    useEffect(() => {
        chatMessagesWS?.close()
        if (selectedChat) {
            createChatMessagesWS(selectedChat.id, dispatch)
        }
    }, [selectedChat, lastLoggedInUpdate])

    const sendMessage = useCallback(() => {
        if (selectedChat?.id && (messageInput.trim() || selectedFiles.length)) {
            dispatch(sendMessageAction(selectedChat.id, messageInput.trim(), selectedFiles.map(f => f.file), selectedParentMessage?.id))
            setSelectedFiles([])
            setMessageInput('')
            setSelectedParentMessage(undefined)
            secureLocalStorage.removeItem(`chat${selectedChat.id}`)
            secureLocalStorage.removeItem(`chat${selectedChat.id}SelectedParentMessage`)
            setLastMessageBeforeNewMessage(messages?.[0]?.id)
        }
        if (newPersonalChatUserId && (messageInput.trim() || selectedFiles.length)) {
            dispatch(createPersonalChatAction(newPersonalChatUserId, messageInput.trim(), selectedFiles.map(f => f.file)))
            setSelectedFiles([])
            setMessageInput('')
            setSelectedParentMessage(undefined)
            setOpenCreatedChat(true)
        }
    }, [messageInput, selectedChat, selectedFiles, newPersonalChatUserId])

    useEffect(() => {
        if (openCreatedChat) {
            setOpenCreatedChat(false)
            setSelectedChat(chats[0])
            setNewPersonalChatUserId(undefined)
        } else {
            if (selectedChat) {
                const selectedChatInState = chats?.find(chat => chat?.id === selectedChat?.id)
                const selectedChatUpdated =  selectedChat?.chat_name !== selectedChatInState?.chat_name
                if (selectedChatUpdated && selectedChatInState) {
                    setSelectedChatName(selectedChatInState.chat_name)
                    setSelectedChatPhoto(selectedChatInState.chat_photo)
                }
                if (!selectedChatInState) setSelectedChat(null)
            }
        }
    }, [chats, selectedChat])

    const openPersonalChat = useCallback((userId) => {
        setSelectedChat(null)
        setMessageInput('')
        setSelectedParentMessage(undefined)
        setNewPersonalChatUserId(undefined)
        const user = getUserProfileByUserId(userProfiles, userId)
        dispatch(findPersonalChatAction(userId))
        setFindPersonalChatWithUser(userId)
        setSelectedChatName(`${user?.user?.first_name} ${user?.user?.last_name}`)
        setSelectedChatPhoto(user?.user?.photo)
    }, [userProfiles])

    useEffect(() => {
        if (userProfiles?.length && openPersonalChatWithUser) {
            openPersonalChat(openPersonalChatWithUser)
            secureLocalStorage.removeItem('openPersonalChatWithUser')
        }
    }, [openPersonalChatWithUser, userProfiles, openPersonalChat]);

    useEffect(() => {
        if (!findPersonalChat.isLoading && findPersonalChatWithUser) {
            if (findPersonalChat.chatId) {
                setSelectedChat({
                    id: findPersonalChat.chatId,
                    chat_name: selectedChatName,
                    chat_photo: selectedChatPhoto,
                    is_group: false,
                })
            } else {
                setNewPersonalChatUserId(findPersonalChatWithUser)
            }
            setFindPersonalChatWithUser(undefined)
        }
    }, [findPersonalChat, findPersonalChatWithUser])

    const scrollToMessage = useCallback((messageId: number, highlightMessage: boolean = true) => {
        const element = document.getElementById(messageId?.toString())

        let successScroll = false

        if (element && messagesContainerRef?.current) {
            messagesContainerRef?.current?.scrollTo({
                top: element.offsetTop - element.offsetHeight * 0.5 - messagesContainerRef.current.offsetHeight * 0.4,
                behavior: highlightMessage ? 'smooth' : 'instant',
            })
            successScroll = true
        }

        clearTimeout(highlightScrolledMessageTimeout)

        if (highlightMessage) {
            setHighlightScrolledMessage(messageId)
            setHighlightScrolledMessageTimeout(
                setTimeout(
                    () => {
                        setHighlightScrolledMessage(undefined)
                        setHighlightScrolledMessageTimeout(undefined)
                    },
                    1000,
                )
            )
        }

        return successScroll
    }, [highlightScrolledMessageTimeout, messagesContainerRef])

    const onTextInput = useCallback((value: string) => {
        if (selectedChat?.id) {
            if (value) secureLocalStorage.setItem(`chat${selectedChat.id}`, value)
            else secureLocalStorage.removeItem(`chat${selectedChat.id}`)
        }
        setMessageInput(value)
    }, [selectedChat])

    const scrollToTop = useCallback(() => {
        if (messages?.[0]?.unread_by_current_user) dispatch(readMessageAction(selectedChat?.id, messages?.[0]?.id, true))
        messagesContainerRef?.current?.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }, [messagesContainerRef, messages])

    useEffect(() => {
        if (scrollToLastReadMessage && messages?.length) {
            if (lastReadMessageId) {
                if (scrollToMessage(lastReadMessageId, false)) setScrollToLastReadMessage(false)
            } else {
                scrollToTop()
                setScrollToLastReadMessage(false)
            }
        }
    }, [scrollToLastReadMessage, messages, lastReadMessageId, scrollToMessage, scrollToTop])

    return (
        <Flex className={'messagesPage'}>
            <Flex vertical={false}>
                <Flex vertical className={'messagesLeftPanelContainer'}>
                    <Input
                        value={searchChatsText}
                        placeholder={'Поиск чатов или пользователей'}
                        size={'small'}
                        className={'messagesChatsSearch'}
                        onChange={(e) => {
                            setSearchChatsText(e.target.value)
                            if (e.target.value) secureLocalStorage.setItem('chatsSearchText', e.target.value)
                            else secureLocalStorage.removeItem('chatsSearchText')
                            dispatch(getChatsAction(e.target.value))
                        }}
                    />
                    <Flex className={'messagesChatListContainer'} vertical>
                        {chats?.map((chat) => (
                            <Chat
                                key={chat.id}
                                chat={chat}
                                isSelected={selectedChat?.id === chat.id}
                                onSelect={() => {
                                    if (selectedChat?.id === chat.id) {
                                        scrollToTop()
                                    } else {
                                        setSelectedChat(chat)
                                        setNewPersonalChatUserId(null)
                                        setSelectedParentMessage(undefined)
                                    }
                                }}
                                draftMessage={secureLocalStorage.getItem(`chat${chat.id}`)}
                            />
                        ))}
                        {searchChatsText ? (
                            userProfiles?.filter((userProfile) => {
                                if (userProfile?.user?.id === userInfo?.user_id) return false
                                const userProfileChatName = `${userProfile?.user?.first_name} ${userProfile?.user?.last_name}`
                                return (
                                    !chats?.find((chat) => chat.chat_name?.toLowerCase().indexOf(userProfileChatName.toLowerCase()) !== -1) &&
                                    userProfileChatName.toLowerCase().indexOf(searchChatsText.toLowerCase()) !== -1
                                )
                            }).map((userProfile) => (
                                <Chat
                                    key={userProfile?.id}
                                    chat={{
                                        chat_name: `${userProfile?.user?.first_name} ${userProfile?.user?.last_name}`,
                                        chat_photo: userProfile?.user?.photo,
                                        last_message: 'Написать сообщение',
                                    }}
                                    isSelected={newPersonalChatUserId === userProfile?.user?.id}
                                    onSelect={() => {
                                        setSelectedChat(null)
                                        setMessageInput('')
                                        setSelectedParentMessage(undefined)
                                        setNewPersonalChatUserId(userProfile?.user?.id)
                                        setSelectedChatName(`${userProfile?.user?.first_name} ${userProfile?.user?.last_name}`)
                                        setSelectedChatPhoto(userProfile?.user?.photo)
                                    }}
                                />
                            ))
                        ) : null}
                    </Flex>
                    <div className={'messagesCreateGroupChatButton'} onClick={() => setIsCreateChatModalOpen(true)}>
                        <span>
                            Создать групповой чат
                        </span>
                    </div>
                </Flex>
                <Flex vertical className={'messagesRightPanelContainer'}>
                    {selectedChat || newPersonalChatUserId ? (
                        <div className={'messagesChatContainer'}>
                            {!selectedChat?.is_group ? (
                                <UserPhoto url={selectedChatPhoto}/>
                            ) : null}
                            <div className={'messagesChatNameContainer'}>
                                <b className={'messagesChatName'}>
                                    {selectedChatName}
                                    {!selectedChat?.is_group || newPersonalChatUserId ? (
                                        renderUserPostAndCompanyName(userProfiles, newPersonalChatUserId, selectedChat?.chat_name)
                                    ) : null}
                                </b>
                                {selectedChat?.is_group ? (
                                    <span
                                        className={'messagesChatParticipants'}
                                        onClick={() => setIsParticipantsModalOpen(true)}
                                    >
                                        Участники: {participants?.length}
                                    </span>
                                ) : null}
                            </div>
                            {selectedChat?.is_group && selectedChat?.author_id === userInfo?.user_id ? (
                                <div className={'messagesChatActions'}>
                                    <Dropdown
                                        trigger={['click']}
                                        menu={{
                                            items: [
                                                {
                                                    key: 'edit',
                                                    label: 'Переименовать',
                                                    onClick: () => {
                                                        setUpgradingGroupChat(selectedChat)
                                                        setIsCreateChatModalOpen(true)
                                                    },
                                                    icon: <EditOutlined/>,
                                                },
                                                {
                                                    key: 'delete',
                                                    label: 'Удалить',
                                                    danger: true,
                                                    onClick: () => dispatch(openConfirmationDialogAction({
                                                        title: 'Подтверждение',
                                                        message: `Удалить групповой чат "${selectedChat?.chat_name}" ?`,
                                                        onApply: () => {
                                                            setSelectedChat(undefined)
                                                            dispatch(deleteGroupChatAction(selectedChat?.id))
                                                        },
                                                        applyText: 'Да',
                                                    })),
                                                    icon: <DeleteOutlined/>,
                                                }
                                            ],
                                        }}
                                        placement={'bottomRight'}
                                    >
                                        <MoreOutlined className={'iconMedium'}/>
                                    </Dropdown>
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                    {selectedChat || newPersonalChatUserId ? (
                        <Flex
                            vertical
                            className={'messagesChatContentContainer'}
                            ref={messagesContainerRef}
                        >
                            {newPersonalChatUserId || (selectedChat?.is_group && !participants?.length) ? (
                                <div/>
                            ) : (
                                messages?.length ? (
                                    messages?.map((message, index) => (
                                        <div key={message.id}>
                                            {index === 0 ? (
                                                <InView
                                                    as={'div'}
                                                    onChange={(isView) => setIsChatBottomVisible(isView)}
                                                />
                                            ) : null}
                                            <Message
                                                message={message}
                                                isHighlighting={highlightScrolledMessage === message.id}
                                                onMessageRead={() => {
                                                    if (!scrollToLastReadMessage && isOnline) dispatch(readMessageAction(selectedChat?.id, message.id, true))
                                                }}
                                                authUserId={userInfo?.user_id}
                                                onMessageDoubleClick={() => {
                                                    secureLocalStorage.setItem(`chat${selectedChat.id}SelectedParentMessage`, JSON.stringify(message))
                                                    setSelectedParentMessage(message)
                                                }}
                                                isGroupChat={selectedChat?.is_group}
                                                participants={participants}
                                                openPersonalChat={(userId) => openPersonalChat(userId)}
                                                getParentMessageAndUser={() => {
                                                    const parentMessage = messages.find((m) => m.id === message.parent_message_id)
                                                    return [parentMessage, getUserProfileByUserId(userProfiles, parentMessage?.author_id)]
                                                }}
                                                scrollToMessage={(messageId) => scrollToMessage(messageId)}
                                            />
                                            {(
                                                message.id === lastReadMessageId &&
                                                index !== 0
                                            ) ? <Divider plain>Новые сообщения</Divider> : null}
                                        </div>
                                    ))
                                ) : <div/>
                            )}
                        </Flex>
                    ) : null}
                    {selectedChat || newPersonalChatUserId ? (
                        <div style={{ position: 'relative' }}>
                            {selectedChat && !isChatBottomVisible ? (
                                <div className={'messagesScrollToChatBottomButtonContainer'}>
                                    <Badge
                                        value={chats?.find((chat) => selectedChat.id === chat.id)?.unread_count}
                                        xOffset={15}
                                        yOffset={-5}
                                    >
                                        <Button
                                            className={'messagesScrollToChatBottomButton'}
                                            shape={'round'}
                                            onClick={scrollToTop}
                                            size={'small'}
                                        >
                                            <ArrowDownOutlined/>
                                        </Button>
                                    </Badge>
                                </div>
                            ) : null}
                            <MessageInput
                                onTextInput={onTextInput}
                                textInput={messageInput}
                                selectedFiles={selectedFiles}
                                onSelectFiles={(selected) => setSelectedFiles([...selectedFiles, ...selected])}
                                onDeselectFiles={(filePosition) => {
                                    const newSelectedFiles = [...selectedFiles]
                                    newSelectedFiles.splice(filePosition, 1)
                                    setSelectedFiles(newSelectedFiles)
                                }}
                                onSendPress={sendMessage}
                                parentMessage={selectedParentMessage}
                                getParentMessageTitle={() => {
                                    const user = getUserProfileByUserId(userProfiles, selectedParentMessage?.author_id)
                                    const userName = user?.user?.first_name + ' ' + user?.user?.last_name
                                    return `Ответ на сообщение (${userName})`
                                }}
                                onPressParentMessage={() => scrollToMessage(selectedParentMessage.id)}
                                onRemoveParentMessage={() => {
                                    secureLocalStorage.removeItem(`chat${selectedChat.id}SelectedParentMessage`)
                                    setSelectedParentMessage(undefined)
                                }}
                                textInputPlaceholder={'Введите сообщение'}
                            />
                        </div>
                    ) : <div className={'messagesChatInputEmpty'}/>}
                </Flex>
            </Flex>

            <GroupChatModal
                title={updatingGroupChat ? 'Переименовать групповой чат' : 'Создать групповой чат'}
                isOpen={isCreateChatModalOpen}
                onAccept={(name: string) => {
                    if (searchChatsText !== name) {
                        secureLocalStorage.removeItem('chatsSearchText')
                        setSearchChatsText('')
                    }
                    setIsCreateChatModalOpen(false)
                    if (updatingGroupChat) {
                        dispatch(updateGroupChatAction(selectedChat?.id, name))
                    } else {
                        dispatch(createGroupChatAction(name))
                        setOpenCreatedChat(true)
                    }
                    setUpgradingGroupChat(undefined)
                }}
                onClose={() => setIsCreateChatModalOpen(false)}
                defaultName={updatingGroupChat ? selectedChatName : searchChatsText}
            />
            <GroupChatParticipantsModal
                title={'Участники'}
                isOpen={isParticipantsModalOpen}
                onClose={() => setIsParticipantsModalOpen(false)}
                participants={participants}
                possibleParticipants={userProfiles?.filter((userProfile) => !participants?.some((participant) => participant.id === userProfile?.user?.id))}
                onAddParticipant={selectedChat?.author_id === userInfo?.user_id ? (userId: number) => dispatch(addChatParticipantAction(selectedChat?.id, userId)) : undefined}
                onDeleteParticipant={selectedChat?.author_id === userInfo?.user_id ? (userId: number) => dispatch(removeChatParticipantAction(selectedChat?.id, userId)) : undefined}
                authUserId={userInfo?.user_id}
                onOpenPersonalChat={(userId) => {
                    setIsParticipantsModalOpen(false)
                    openPersonalChat(userId)
                }}
            />
        </Flex>
    )
}
