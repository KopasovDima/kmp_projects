import {
    ADD_CHAT_PARTICIPANT_REQUEST,
    CREATE_GROUP_CHAT_REQUEST,
    CREATE_PERSONAL_CHAT_REQUEST,
    DELETE_GROUP_CHAT_REQUEST,
    FIND_PERSONAL_CHAT_REQUEST,
    GET_CHAT_MESSAGES_REQUEST,
    GET_CHAT_PARTICIPANTS_REQUEST,
    GET_CHATS_REQUEST,
    GET_UNREAD_CHATS_COUNT_REQUEST,
    GET_USER_PROFILES_REQUEST,
    ON_CHAT_MESSAGES_RESPONSE,
    ON_CHAT_PARTICIPANTS_RESPONSE,
    ON_CHATS_RESPONSE,
    ON_FIND_PERSONAL_CHAT_RESPONSE,
    ON_UNREAD_CHATS_COUNT_RESPONSE,
    ON_USER_PROFILES_RESPONSE,
    READ_MESSAGE_REQUEST,
    REMOVE_CHAT_PARTICIPANT_REQUEST,
    SEND_MESSAGE_REQUEST,
    UPDATE_GROUP_CHAT_REQUEST,
} from '@/store/actionTypes'

export const getChatsAction = (searchName: string = '') => ({
    type: GET_CHATS_REQUEST,
    searchName,
})

export const onChatsResponseAction = (chats: any[]) => ({
    type: ON_CHATS_RESPONSE,
    chats,
})

export const getChatMessagesAction = (chatId: number, sameChat: boolean) => ({
    type: GET_CHAT_MESSAGES_REQUEST,
    chatId,
    sameChat,
})

export const onChatMessagesResponseAction = (messages: any[], lastReadMessageId: number | undefined) => ({
    type: ON_CHAT_MESSAGES_RESPONSE,
    messages,
    lastReadMessageId,
})

export const getUnreadChatsCountAction = () => ({
    type: GET_UNREAD_CHATS_COUNT_REQUEST,
})

export const onUnreadChatsCountResponseAction = (count: number) => ({
    type: ON_UNREAD_CHATS_COUNT_RESPONSE,
    count,
})

export const sendMessageAction = (chatId: number, message: string, files: any[], parentMessageId: number | undefined) => ({
    type: SEND_MESSAGE_REQUEST,
    chatId,
    message,
    files,
    parentMessageId,
})

export const readMessageAction = (chatId: number, messageId: number, readAllMessagesBefore) => ({
    type: READ_MESSAGE_REQUEST,
    chatId,
    messageId,
    readAllMessagesBefore,
})

export const createPersonalChatAction = (userId: number, firstMessage: string = '', files: any[]) => ({
    type: CREATE_PERSONAL_CHAT_REQUEST,
    userId,
    firstMessage,
    files,
})

export const createGroupChatAction = (name: string) => ({
    type: CREATE_GROUP_CHAT_REQUEST,
    name,
})

export const updateGroupChatAction = (chatId: number, name: string) => ({
    type: UPDATE_GROUP_CHAT_REQUEST,
    chatId,
    name,
})

export const deleteGroupChatAction = (chatId: number) => ({
    type: DELETE_GROUP_CHAT_REQUEST,
    chatId,
})

export const getChatParticipantsAction = (chatId: number, clearPrevValues: boolean = false) => ({
    type: GET_CHAT_PARTICIPANTS_REQUEST,
    chatId,
    clearPrevValues,
})

export const onChatParticipantsResponseAction = (chatId: number, participants: any[]) => ({
    type: ON_CHAT_PARTICIPANTS_RESPONSE,
    chatId,
    participants,
})

export const getUserProfilesAction = (includeCompanyName: boolean) => ({
    type: GET_USER_PROFILES_REQUEST,
    includeCompanyName,
})

export const onUserProfilesResponseAction = (userProfiles: any[]) => ({
    type: ON_USER_PROFILES_RESPONSE,
    userProfiles,
})

export const addChatParticipantAction = (chatId: number, userId: number) => ({
    type: ADD_CHAT_PARTICIPANT_REQUEST,
    chatId,
    userId,
})

export const removeChatParticipantAction = (chatId: number, userId: number) => ({
    type: REMOVE_CHAT_PARTICIPANT_REQUEST,
    chatId,
    userId,
})

export const findPersonalChatAction = (userId: number) => ({
    type: FIND_PERSONAL_CHAT_REQUEST,
    userId,
})

export const onFindPersonalChatResponseAction = (chatId: number | undefined) => ({
    type: ON_FIND_PERSONAL_CHAT_RESPONSE,
    chatId,
})
