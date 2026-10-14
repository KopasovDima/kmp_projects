import {
    ADD_ORDER_ATTACHMENTS_REQUEST,
    GET_ORDER_ATTACHMENTS_REQUEST,
    GET_ORDERS_REQUEST,
    ON_CREATE_ORDER_RESPONSE,
    ON_DELETE_ORDER_RESPONSE,
    ON_ORDER_ATTACHMENTS_RESPONSE,
    ON_ORDERS_RESPONSE,
    ON_UPDATE_ORDER_RESPONSE,
    REMOVE_ORDER_ATTACHMENTS_REQUEST
} from '@/store/actionTypes'

const initialState: {
    orders: any[]
    attachments: any[]
    isLoading: boolean
} = {
    orders: [],
    attachments: [],
    isLoading: false,
}

export const ordersReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case GET_ORDERS_REQUEST: {
            return {
                ...state,
                isLoading: !state?.orders?.length,
            }
        }
        case ON_ORDERS_RESPONSE: {
            return {
                ...state,
                orders: action.orders,
                isLoading: false,
            }
        }
        case ON_CREATE_ORDER_RESPONSE: {
            return {
                ...state,
                orders: [
                    ...state.orders,
                    action.createdOrder,
                ],
            }
        }
        case ON_UPDATE_ORDER_RESPONSE: {
            return {
                ...state,
                orders: state.orders.map((order) => order.id === action.updatedOrder?.id ? action.updatedOrder : order),
            }
        }
        case ON_DELETE_ORDER_RESPONSE: {
            return {
                ...state,
                orders: state.orders.filter((order) => order.id !== action.orderId),
            }
        }
        case GET_ORDER_ATTACHMENTS_REQUEST: {
            return {
                ...state,
                attachments: action.sameOrder ? [...state.attachments] : [],
            }
        }
        case ON_ORDER_ATTACHMENTS_RESPONSE: {
            return {
                ...state,
                orders: state.orders?.map((order) => order.id === action.orderId ? ({
                    ...order,
                    attachments_count: action.attachments.length,
                }) : order),
                attachments: action.attachments,
            }
        }
        case ADD_ORDER_ATTACHMENTS_REQUEST: {
            return {
                ...state,
                orders: state.orders?.map((order) => order.id === action.orderId ? ({
                    ...order,
                    attachments_count: order.attachments_count + action.files.length,
                }) : order),
                attachments: [...state.attachments, ...action.files?.map((file, index) => ({
                    id: `uploading-${index}-${Math.round(Math.random() * 100000)}`,
                    filename: 'Загрузка',
                    isLoading: true,
                    url: file.preview,
                    mimetype: file.file.type,
                }))],
            }
        }
        case REMOVE_ORDER_ATTACHMENTS_REQUEST: {
            return {
                ...state,
                orders: state.orders?.map((order) => order.id === action.orderId ? ({
                    ...order,
                    attachments_count: order.attachments_count - action.attachmentIds.length,
                }) : order),
            }
        }
        default:
            return {...state}
    }
}