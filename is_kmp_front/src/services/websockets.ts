import {ENV} from '@/consts'
import {getAuthToken} from '@/utils'
import {
    getChatMessagesAction,
    getChatsAction,
    getOfferCommentsAction,
    getOffersAction,
    getUnreadChatsCountAction,
    getUnreadOffersCountAction
} from '@/store/actions'

export let chatsListWS
export let chatMessagesWS
export let offersListWS
export let offerCommentsWS


export const createChatsListWS = (userId, dispatch) => {
    if (!ENV.WS_SERVER_URL) return null

    chatsListWS = new WebSocket(`${ENV.WS_SERVER_URL}/ws/chats_list/${userId}/`)
    chatsListWS.onopen = () => {
        chatsListWS.send(JSON.stringify({
            'authorization': `Bearer ${getAuthToken()}`
        }))
    }

    chatsListWS.onmessage = (event) => {
        const json_event = JSON.parse(event.data)
        if ('user_chats_updated' in json_event) {
            dispatch(getUnreadChatsCountAction())
            if (window.location.pathname.indexOf('messages') !== -1) {
                dispatch(getChatsAction(localStorage.getItem('chatsSearchText') as string))
            }
        }
    }

    chatsListWS.onclose = (e) => {
        if (!e.wasClean) {
            createChatsListWS(userId, dispatch)
        }
    }
}


export const createChatMessagesWS = (chatId, dispatch) => {
    if (!ENV.WS_SERVER_URL) return null

    chatMessagesWS = new WebSocket(`${ENV.WS_SERVER_URL}/ws/chats/${chatId}/`)
    chatMessagesWS.onopen = () => {
        chatMessagesWS.send(JSON.stringify({
            'authorization': `Bearer ${getAuthToken()}`
        }))
    }

    chatMessagesWS.onmessage = (event) => {
        const json_event = JSON.parse(event.data)
        if ('message_id' in json_event) {
            dispatch(getChatMessagesAction(chatId, true))
        }
    }

    chatMessagesWS.onclose = (e) => {
        if (!e.wasClean) {
            createChatMessagesWS(chatId, dispatch)
        }
    }
}

export const createOffersListWS = (userId, dispatch) => {
    if (!ENV.WS_SERVER_URL) return null

    offersListWS = new WebSocket(`${ENV.WS_SERVER_URL}/ws/offers/${userId}/`)
    offersListWS.onopen = () => {
        offersListWS.send(JSON.stringify({
            'authorization': `Bearer ${getAuthToken()}`
        }))
    }

    offersListWS.onmessage = (event) => {
        const json_event = JSON.parse(event.data)
        if ('offers_updated' in json_event) {
            dispatch(getUnreadOffersCountAction())
            if (window.location.pathname.indexOf('offers') !== -1) {
                dispatch(getOffersAction())
            }
        }
    }

    offersListWS.onclose = (e) => {
        if (!e.wasClean) {
            createOffersListWS(userId, dispatch)
        }
    }
}


export const createOfferCommentsWS = (offerId, dispatch) => {
    if (!ENV.WS_SERVER_URL) return null

    offerCommentsWS = new WebSocket(`${ENV.WS_SERVER_URL}/ws/offers/${offerId}/comments/`)
    offerCommentsWS.onopen = () => {
        offerCommentsWS.send(JSON.stringify({
            'authorization': `Bearer ${getAuthToken()}`
        }))
    }

    offerCommentsWS.onmessage = (event) => {
        const json_event = JSON.parse(event.data)
        if ('comment_id' in json_event) {
            dispatch(getOfferCommentsAction(offerId, true))
        }
    }

    offerCommentsWS.onclose = (e) => {
        if (!e.wasClean) {
            createOfferCommentsWS(offerId, dispatch)
        }
    }
}
