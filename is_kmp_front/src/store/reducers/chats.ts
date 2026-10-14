import {
    FIND_PERSONAL_CHAT_REQUEST,
    GET_CHAT_MESSAGES_REQUEST,
    GET_CHAT_PARTICIPANTS_REQUEST,
    GET_USER_PROFILES_REQUEST,
    ON_CHAT_MESSAGES_RESPONSE,
    ON_CHAT_PARTICIPANTS_RESPONSE,
    ON_CHATS_RESPONSE,
    ON_FIND_PERSONAL_CHAT_RESPONSE,
    ON_UNREAD_CHATS_COUNT_RESPONSE,
    ON_USER_PROFILES_RESPONSE,
} from '@/store/actionTypes'

const initialState: {
    chats: any[]
    messages: any[]
    lastReadMessageId: number | undefined
    unreadChatsCount: number
    participants: any[]
    userProfiles: any[]
    findPersonalChat: any
} = {
    chats: [],
    messages: [],
    lastReadMessageId: undefined,
    unreadChatsCount: 0,
    participants: [],
    userProfiles: [],
    findPersonalChat: {},
}

export const chatsReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case ON_CHATS_RESPONSE: {
            return {
                ...state,
                chats: action.chats,
            }
        }
        case GET_CHAT_MESSAGES_REQUEST: {
            return {
                ...state,
                messages: action.sameChat ? [...state.messages] : [],
                lastReadMessageId: action.sameChat ? state.lastReadMessageId : undefined,
            }
        }
        case ON_CHAT_MESSAGES_RESPONSE: {
            return {
                ...state,
                messages: action.messages,
                lastReadMessageId: (
                    state.lastReadMessageId &&
                    'unread_by_current_user' in action.messages?.[0]
                ) ? state.lastReadMessageId : action.lastReadMessageId,
            }
        }
        case ON_UNREAD_CHATS_COUNT_RESPONSE: {
            return {
                ...state,
                unreadChatsCount: action.count,
            }
        }
        case GET_CHAT_PARTICIPANTS_REQUEST: {
            return {
                ...state,
                participants: action.clearPrevValues ? undefined : state.participants,
            }
        }
        case ON_CHAT_PARTICIPANTS_RESPONSE: {
            return {
                ...state,
                participants: action.participants,
            }
        }
        case GET_USER_PROFILES_REQUEST: {
            return {
                ...state,
                userProfiles: undefined,
            }
        }
        case ON_USER_PROFILES_RESPONSE: {
            return {
                ...state,
                userProfiles: action.userProfiles,
            }
        }
        case FIND_PERSONAL_CHAT_REQUEST: {
            return {
                ...state,
                findPersonalChat: {
                    isLoading: true,
                }
            }
        }
        case ON_FIND_PERSONAL_CHAT_RESPONSE: {
            return {
                ...state,
                findPersonalChat: {
                    chatId: action.chatId,
                },
            }
        }
        default:
            return {...state}
    }
}