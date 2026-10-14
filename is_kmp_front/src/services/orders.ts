import {sendIsKmpRequest} from '@/services'

export const getOrdersRequest = async () => {
    return await sendIsKmpRequest('orders/', 'GET')
}

export const createOrderRequest = async (name: string, description: string) => {
    return await sendIsKmpRequest(
        'orders/create/',
        'POST',
        {
            name,
            description,
        },
    )
}

export const updateOrderRequest = async (orderId: number, name: string, description: string) => {
    return await sendIsKmpRequest(
        `orders/${orderId}/update/`,
        'PUT',
        {
            name,
            description,
        }
    )
}

export const deleteOrderRequest = async (orderId: number) => {
    return await sendIsKmpRequest(`orders/${orderId}/delete/`, 'DELETE')
}

export const getOrderAttachmentsRequest = async (orderId: number) => {
    return await sendIsKmpRequest(`orders/${orderId}/attachments/`, 'GET')
}

export const addOrderAttachmentsRequest = async (orderId: number, files: any[]) => {
    return await sendIsKmpRequest(
        `orders/${orderId}/add_attachments/`,
        'POST',
        {...Object.fromEntries(files.map(({file}, i) => [i, {file}]))}
    )
}

export const removeOrderAttachmentsRequest = async (orderId: number, attachmentIds) => {
    return await sendIsKmpRequest(`orders/${orderId}/remove_attachments/?ids=${attachmentIds.join()}`, 'DELETE')
}
