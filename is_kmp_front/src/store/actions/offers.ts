import {
    ADD_OFFER_ATTACHMENTS_REQUEST,
    CREATE_OFFER_REQUEST,
    DELETE_OFFER_REQUEST,
    GET_OFFER_ATTACHMENTS_REQUEST,
    GET_OFFER_COMMENTS_REQUEST,
    GET_OFFERS_REQUEST,
    GET_UNREAD_OFFERS_COUNT_REQUEST,
    ON_CREATE_OFFER_RESPONSE,
    ON_DELETE_OFFER_RESPONSE,
    ON_OFFER_ATTACHMENTS_RESPONSE,
    ON_OFFER_COMMENTS_RESPONSE,
    ON_OFFERS_RESPONSE,
    ON_UNREAD_OFFERS_COUNT_RESPONSE,
    ON_UPDATE_OFFER_RESPONSE,
    READ_COMMENT_REQUEST,
    REMOVE_OFFER_ATTACHMENTS_REQUEST,
    SEND_COMMENT_REQUEST,
    UPDATE_OFFER_REQUEST,
} from '@/store/actionTypes'

export const getOffersAction = () => ({
    type: GET_OFFERS_REQUEST,
})

export const onOffersResponseAction = (offers: any[]) => ({
    type: ON_OFFERS_RESPONSE,
    offers,
})

export const createOfferAction = (name: string, description: string, company: string) => ({
    type: CREATE_OFFER_REQUEST,
    name,
    description,
    company,
})

export const onCreateOfferResponseAction = (createdOffer: any) => ({
    type: ON_CREATE_OFFER_RESPONSE,
    createdOffer,
})

export const updateOfferAction = (offerId: number, name: string, description: string, company: string) => ({
    type: UPDATE_OFFER_REQUEST,
    offerId,
    name,
    description,
    company,
})

export const onUpdateOfferResponseAction = (updatedOffer: any) => ({
    type: ON_UPDATE_OFFER_RESPONSE,
    updatedOffer,
})

export const deleteOfferAction = (offerId: number) => ({
    type: DELETE_OFFER_REQUEST,
    offerId,
})

export const onDeleteOfferResponseAction = (offerId: number) => ({
    type: ON_DELETE_OFFER_RESPONSE,
    offerId,
})

export const getOfferCommentsAction = (offerId: number, sameOffer: boolean) => ({
    type: GET_OFFER_COMMENTS_REQUEST,
    offerId,
    sameOffer,
})

export const onOfferCommentsResponseAction = (comments: any[], lastReadCommentId: number | undefined) => ({
    type: ON_OFFER_COMMENTS_RESPONSE,
    comments,
    lastReadCommentId,
})

export const getUnreadOffersCountAction = () => ({
    type: GET_UNREAD_OFFERS_COUNT_REQUEST,
})

export const onUnreadOffersCountResponseAction = (count: number) => ({
    type: ON_UNREAD_OFFERS_COUNT_RESPONSE,
    count,
})

export const sendCommentAction = (offerId: number, comment: string, parentCommentId: number | undefined) => ({
    type: SEND_COMMENT_REQUEST,
    offerId,
    comment,
    parentCommentId,
})

export const readCommentAction = (offerId: number, commentId: number, readAllCommentsBefore: boolean) => ({
    type: READ_COMMENT_REQUEST,
    offerId,
    commentId,
    readAllCommentsBefore,
})

export const getOfferAttachmentsAction = (offerId: number, sameOffer: boolean) => ({
    type: GET_OFFER_ATTACHMENTS_REQUEST,
    offerId,
    sameOffer,
})

export const onOfferAttachmentsResponseAction = (offerId: number, attachments: any[]) => ({
    type: ON_OFFER_ATTACHMENTS_RESPONSE,
    offerId,
    attachments,
})

export const addOfferAttachmentsAction = (offerId: number, files: any[], loadAttachments: boolean) => ({
    type: ADD_OFFER_ATTACHMENTS_REQUEST,
    offerId,
    files,
    loadAttachments,
})

export const removeOfferAttachmentsAction = (offerId: number, attachmentIds: number[]) => ({
    type: REMOVE_OFFER_ATTACHMENTS_REQUEST,
    offerId,
    attachmentIds,
})

