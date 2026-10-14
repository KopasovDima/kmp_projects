import {
    ADD_ORDER_ATTACHMENTS_REQUEST,
    CREATE_ORDER_REQUEST,
    DELETE_ORDER_REQUEST,
    GET_ORDER_ATTACHMENTS_REQUEST,
    GET_ORDERS_REQUEST,
    ON_CREATE_ORDER_RESPONSE,
    ON_DELETE_ORDER_RESPONSE,
    ON_ORDER_ATTACHMENTS_RESPONSE,
    ON_ORDERS_RESPONSE,
    ON_UPDATE_ORDER_RESPONSE,
    REMOVE_ORDER_ATTACHMENTS_REQUEST,
    UPDATE_ORDER_REQUEST
} from '@/store/actionTypes/orders.ts'

export const getOrdersAction = () => ({
    type: GET_ORDERS_REQUEST,
})

export const onOrdersResponseAction = (orders: any[]) => ({
    type: ON_ORDERS_RESPONSE,
    orders,
})

export const createOrderAction = (name: string, description: string) => ({
    type: CREATE_ORDER_REQUEST,
    name,
    description,
})

export const onCreateOrderResponseAction = (createdOrder: any) => ({
    type: ON_CREATE_ORDER_RESPONSE,
    createdOrder,
})

export const updateOrderAction = (orderId: number, name: string, description: string) => ({
    type: UPDATE_ORDER_REQUEST,
    orderId,
    name,
    description,
})

export const onUpdateOrderResponseAction = (updatedOrder: any) => ({
    type: ON_UPDATE_ORDER_RESPONSE,
    updatedOrder,
})

export const deleteOrderAction = (orderId: number) => ({
    type: DELETE_ORDER_REQUEST,
    orderId,
})

export const onDeleteOrderResponseAction = (orderId: number) => ({
    type: ON_DELETE_ORDER_RESPONSE,
    orderId,
})

export const getOrderAttachmentsAction = (orderId: number, sameOrder: boolean) => ({
    type: GET_ORDER_ATTACHMENTS_REQUEST,
    orderId,
    sameOrder,
})

export const onOrderAttachmentsResponseAction = (orderId: number, attachments: any[]) => ({
    type: ON_ORDER_ATTACHMENTS_RESPONSE,
    orderId,
    attachments,
})

export const addOrderAttachmentsAction = (orderId: number, files: any[], loadAttachments: boolean) => ({
    type: ADD_ORDER_ATTACHMENTS_REQUEST,
    orderId,
    files,
    loadAttachments,
})

export const removeOrderAttachmentsAction = (orderId: number, attachmentIds: number[]) => ({
    type: REMOVE_ORDER_ATTACHMENTS_REQUEST,
    orderId,
    attachmentIds,
})

