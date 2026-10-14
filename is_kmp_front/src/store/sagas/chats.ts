import {all, call, put, takeEvery, takeLatest} from 'redux-saga/effects'

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
    READ_MESSAGE_REQUEST,
    REMOVE_CHAT_PARTICIPANT_REQUEST,
    SEND_MESSAGE_REQUEST,
    UPDATE_GROUP_CHAT_REQUEST,
} from '@/store/actionTypes'
import {processError} from '@/store/sagas/rootSaga.ts'
import {
    getChatParticipantsAction,
    onChatMessagesResponseAction,
    onChatParticipantsResponseAction,
    onChatsResponseAction,
    onFindPersonalChatResponseAction,
    onUnreadChatsCountResponseAction,
    onUserProfilesResponseAction,
} from '@/store/actions'
import {
    addChatParticipantRequest,
    createGroupChatRequest,
    createPersonalChatRequest,
    deleteGroupChatRequest,
    findPersonalChatRequest,
    getChatMessagesRequest,
    getChatParticipantsRequest,
    getChatsRequest,
    getUnreadChatsCountRequest,
    getUserProfilesRequest,
    readMessageRequest,
    removeChatParticipantRequest,
    sendMessageRequest,
    updateGroupChatRequest
} from '@/services'

function* getChatsSaga(action) {
    try {
        const response = yield call(getChatsRequest, action.searchName)
        yield put(onChatsResponseAction(response.chats))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* getChatMessagesSaga(action) {
    try {
        const response = yield call(getChatMessagesRequest, action.chatId)
        yield put(onChatMessagesResponseAction(response.messages, response.last_read_message_id))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* getUnreadChatsCountSaga(action) {
    try {
        const response = yield call(getUnreadChatsCountRequest)
        yield put(onUnreadChatsCountResponseAction(response.messages_count))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* sendMessageSaga(action) {
    try {
        yield call(sendMessageRequest, action.chatId, action.message, action.files, action.parentMessageId)
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* readMessageSaga(action) {
    try {
        yield call(readMessageRequest, action.chatId, action.messageId, action.readAllMessagesBefore)
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* createPersonalChatSaga(action) {
    try {
        yield call(createPersonalChatRequest, action.userId, action.firstMessage, action.files)
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* createGroupChatSaga(action) {
    try {
        yield call(createGroupChatRequest, action.name)
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* updateGroupChatSaga(action) {
    try {
        yield call(updateGroupChatRequest, action.chatId, action.name)
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* deleteGroupChatSaga(action) {
    try {
        yield call(deleteGroupChatRequest, action.chatId)
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* getChatParticipantsSaga(action) {
    try {
        const response = yield call(getChatParticipantsRequest, action.chatId)
        yield put(onChatParticipantsResponseAction(action.chatId, response.chat_participants))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* getUserProfilesSaga(action) {
    try {
        const {user_profiles} = yield call(getUserProfilesRequest, action.includeCompanyName)
        yield put(onUserProfilesResponseAction(user_profiles))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* addChatParticipantSaga(action) {
    try {
        yield call(addChatParticipantRequest, action.chatId, action.userId)
        yield put(getChatParticipantsAction(action.chatId))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* removeChatParticipantSaga(action) {
    try {
        yield call(removeChatParticipantRequest, action.chatId, action.userId)
        yield put(getChatParticipantsAction(action.chatId))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* findPersonalChatSaga(action) {
    try {
        const response = yield call(findPersonalChatRequest, action.userId)
        yield put(onFindPersonalChatResponseAction(response.chat_id))
    } catch (error) {
        yield put(onFindPersonalChatResponseAction(undefined))
        yield call(processError, action, error)
    }
}

function* chatsSagas() {
    yield all([
        takeLatest(GET_CHATS_REQUEST, getChatsSaga),
        takeLatest(GET_CHAT_MESSAGES_REQUEST, getChatMessagesSaga),
        takeLatest(GET_UNREAD_CHATS_COUNT_REQUEST, getUnreadChatsCountSaga),
        takeLatest(SEND_MESSAGE_REQUEST, sendMessageSaga),
        takeEvery(READ_MESSAGE_REQUEST, readMessageSaga),
        takeLatest(CREATE_PERSONAL_CHAT_REQUEST, createPersonalChatSaga),
        takeLatest(CREATE_GROUP_CHAT_REQUEST, createGroupChatSaga),
        takeLatest(UPDATE_GROUP_CHAT_REQUEST, updateGroupChatSaga),
        takeLatest(DELETE_GROUP_CHAT_REQUEST, deleteGroupChatSaga),
        takeLatest(GET_CHAT_PARTICIPANTS_REQUEST, getChatParticipantsSaga),
        takeLatest(GET_USER_PROFILES_REQUEST, getUserProfilesSaga),
        takeLatest(ADD_CHAT_PARTICIPANT_REQUEST, addChatParticipantSaga),
        takeLatest(REMOVE_CHAT_PARTICIPANT_REQUEST, removeChatParticipantSaga),
        takeLatest(FIND_PERSONAL_CHAT_REQUEST, findPersonalChatSaga),
    ])
}

export default chatsSagas