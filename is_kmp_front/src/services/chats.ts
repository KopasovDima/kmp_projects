import {sendIsKmpRequest} from '@/services'

export const getChatsRequest = async (searchName: string) => {
    return await sendIsKmpRequest('chats/' + (searchName ? '?search_name=' + searchName : ''), 'GET')
}

export const getChatMessagesRequest = async (chatId: number) => {
    return await sendIsKmpRequest(`chats/${chatId}/messages/`, 'GET')
}

export const getUnreadChatsCountRequest = async () => {
    return await sendIsKmpRequest('chats/unread_messages_count/?count_chats=true', 'GET')
}

export const sendMessageRequest = async (chatId: number, message: string, files: any[], parentMessageId: number | undefined) => {
    return await sendIsKmpRequest(
        `chats/${chatId}/write_message/`,
        'POST',
        {
            message,
            ...(parentMessageId ? {parent_message_id: parentMessageId} : {}),
            ...(files?.length > 0 ? Object.fromEntries(files.map((file, i) => [i, {file}])) : {}),
        }
    )
}

export const readMessageRequest = async (chatId: number, messageId: string, readAllMessagesBefore: boolean) => {
    return await sendIsKmpRequest(
        `chats/${chatId}/messages/${messageId}/read/?read_all_messages_before=${readAllMessagesBefore}`,
        'PATCH',
    )
}

export const createPersonalChatRequest = async (userId: number, firstMessage: string, files: any[]) => {
    return await sendIsKmpRequest(
        'chats/create_personal/',
        'POST',
        {
            contact_user_id: userId,
            first_message: firstMessage,
            ...(files?.length > 0 ? Object.fromEntries(files.map((file, i) => [i, file])) : {}),
        },
    )
}

export const createGroupChatRequest = async (name: string) => {
    return await sendIsKmpRequest(
        'chats/create_group/',
        'POST',
        {
            chat_name: name,
        },
    )
}

export const updateGroupChatRequest = async (chatId: number, name: string) => {
    return await sendIsKmpRequest(
        `chats/${chatId}/update/`,
        'PUT',
        {
            chat_name: name,
        },
    )
}

export const deleteGroupChatRequest = async (chatId: number) => {
    return await sendIsKmpRequest(`chats/${chatId}/delete/`, 'DELETE')
}

export const getChatParticipantsRequest = async (chatId: number) => {
    return await sendIsKmpRequest(`chats/${chatId}/participants/`, 'GET')
}

export const addChatParticipantRequest = async (chatId: number, userId: number) => {
    return await sendIsKmpRequest(
        `chats/${chatId}/add_participants/`,
        'PATCH',
        {
            contact_user_ids: userId,
        },
    )
}

export const removeChatParticipantRequest = async (chatId: number, userId: number) => {
    return await sendIsKmpRequest(`chats/${chatId}/participants/${userId}/remove/`, 'DELETE')
}

export const findPersonalChatRequest = async (userId: number) => {
    return await sendIsKmpRequest(`chats/personal_chat/${userId}/`, 'GET')
}
