import {sendIsKmpRequest} from '@/services'

export const getOffersRequest = async () => {
    return await sendIsKmpRequest('offers/', 'GET')
}

export const createOfferRequest = async (name: string, description: string, company: string) => {
    return await sendIsKmpRequest(
        'offers/create/',
        'POST',
        {
            name,
            description,
            company,
        },
    )
}

export const updateOfferRequest = async (offerId: number, name: string, description: string, company: string) => {
    return await sendIsKmpRequest(
        `offers/${offerId}/update/`,
        'PUT',
        {
            name,
            description,
            company,
        }
    )
}

export const deleteOfferRequest = async (offerId: number) => {
    return await sendIsKmpRequest(`offers/${offerId}/delete/`, 'DELETE')
}

export const getCommentsRequest = async (offerId: number) => {
    return await sendIsKmpRequest(`offers/${offerId}/comments/`, 'GET')
}

export const writeOfferCommentRequest = async (offerId: number, comment: string, parentCommentId: number | undefined) => {
    return await sendIsKmpRequest(
        `offers/${offerId}/write_comment/`,
        'POST',
        {
            comment,
            ...(parentCommentId ? {parent_comment_id: parentCommentId} : {}),
        }
    )
}

export const readCommentRequest = async (offerId: number, commentId: number, readAllCommentsBefore: boolean) => {
    return await sendIsKmpRequest(
        `offers/${offerId}/comments/${commentId}/read/?read_all_comments_before=${readAllCommentsBefore}`,
        'PATCH',
    )
}

export const getUnreadOffersCountRequest = async () => {
    return await sendIsKmpRequest('offers/unread_comments_count/?count_offers=true', 'GET')
}

export const getOfferAttachmentsRequest = async (offerId: number) => {
    return await sendIsKmpRequest(`offers/${offerId}/attachments/`, 'GET')
}

export const addOfferAttachmentsRequest = async (offerId: number, files: any[]) => {
    return await sendIsKmpRequest(
        `offers/${offerId}/add_attachments/`,
        'POST',
        {...Object.fromEntries(files.map(({file}, i) => [i, {file}]))}
    )
}

export const removeOfferAttachmentsRequest = async (offerId: number, attachmentIds) => {
    return await sendIsKmpRequest(`offers/${offerId}/remove_attachments/?ids=${attachmentIds.join()}`, 'DELETE')
}
