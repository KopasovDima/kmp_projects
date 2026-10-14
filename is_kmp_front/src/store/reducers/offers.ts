import {
    ADD_OFFER_ATTACHMENTS_REQUEST,
    GET_OFFER_ATTACHMENTS_REQUEST,
    GET_OFFER_COMMENTS_REQUEST,
    GET_OFFERS_REQUEST,
    ON_CREATE_OFFER_RESPONSE,
    ON_DELETE_OFFER_RESPONSE,
    ON_OFFER_ATTACHMENTS_RESPONSE,
    ON_OFFER_COMMENTS_RESPONSE,
    ON_OFFERS_RESPONSE,
    ON_UNREAD_OFFERS_COUNT_RESPONSE,
    ON_UPDATE_OFFER_RESPONSE,
    REMOVE_OFFER_ATTACHMENTS_REQUEST
} from '@/store/actionTypes'

const initialState: {
    offers: any[]
    comments: any[]
    attachments: any[]
    lastReadCommentId: number | undefined
    unreadCommentsCount: number
    isLoading: boolean
    isLoadingComments: boolean
} = {
    offers: [],
    comments: [],
    attachments: [],
    lastReadCommentId: undefined,
    unreadCommentsCount: 0,
    isLoading: false,
    isLoadingComments: false,
}

export const offersReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case GET_OFFERS_REQUEST: {
            return {
                ...state,
                isLoading: !state?.offers?.length,
            }
        }
        case ON_OFFERS_RESPONSE: {
            return {
                ...state,
                offers: action.offers,
                isLoading: false,
            }
        }
        case ON_CREATE_OFFER_RESPONSE: {
            return {
                ...state,
                offers: [
                    ...state.offers,
                    action.createdOffer,
                ],
            }
        }
        case ON_UPDATE_OFFER_RESPONSE: {
            return {
                ...state,
                offers: state.offers.map((offer) => offer.id === action.updatedOffer?.id ? action.updatedOffer : offer),
            }
        }
        case ON_DELETE_OFFER_RESPONSE: {
            return {
                ...state,
                offers: state.offers.filter((offer) => offer.id !== action.offerId),
            }
        }
        case GET_OFFER_COMMENTS_REQUEST: {
            return {
                ...state,
                comments: action.sameOffer ? [...state.comments] : [],
                isLoadingComments: !action.sameOffer && !action.comments?.length,
                lastReadCommentId: action.sameChat ? state.lastReadCommentId : undefined,
            }
        }
        case ON_OFFER_COMMENTS_RESPONSE: {
            return {
                ...state,
                comments: action.comments,
                isLoadingComments: false,
                lastReadCommentId: (
                    state.lastReadCommentId &&
                    'unread_by_current_user' in action.comments?.[0]
                ) ? state.lastReadCommentId : action.lastReadCommentId,
            }
        }
        case ON_UNREAD_OFFERS_COUNT_RESPONSE: {
            return {
                ...state,
                unreadCommentsCount: action.count,
            }
        }
        case GET_OFFER_ATTACHMENTS_REQUEST: {
            return {
                ...state,
                attachments: action.sameOffer ? [...state.attachments] : [],
            }
        }
        case ON_OFFER_ATTACHMENTS_RESPONSE: {
            return {
                ...state,
                offers: state.offers?.map((offer) => offer.id === action.offerId ? ({
                    ...offer,
                    attachments_count: action.attachments.length,
                }) : offer),
                attachments: action.attachments,
            }
        }
        case ADD_OFFER_ATTACHMENTS_REQUEST: {
            return {
                ...state,
                offers: state.offers?.map((offer) => offer.id === action.offerId ? ({
                    ...offer,
                    attachments_count: offer.attachments_count + action.files.length,
                }) : offer),
                attachments: [...state.attachments, ...action.files?.map((file, index) => ({
                    id: `uploading-${index}-${Math.round(Math.random() * 100000)}`,
                    filename: 'Загрузка',
                    isLoading: true,
                    url: file.preview,
                    mimetype: file.file.type,
                }))],
            }
        }
        case REMOVE_OFFER_ATTACHMENTS_REQUEST: {
            return {
                ...state,
                offers: state.offers?.map((offer) => offer.id === action.offerId ? ({
                    ...offer,
                    attachments_count: offer.attachments_count - action.attachmentIds.length,
                }) : offer),
            }
        }
        default:
            return {...state}
    }
}