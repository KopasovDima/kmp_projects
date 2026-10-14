import {
    GET_PURCHASES_REQUEST,
    ON_CREATE_PURCHASE_RESPONSE,
    ON_DELETE_PURCHASE_RESPONSE,
    ON_PURCHASE_TYPES_RESPONSE,
    ON_PURCHASES_RESPONSE,
    ON_PURCHASES_YEARS_RESPONSE,
    ON_UPDATE_PURCHASE_RESPONSE
} from '@/store/actionTypes'

const initialState: {
    purchases: any[]
    purchaseTypes: any[]
    years: any[]
    isLoading: boolean
} = {
    purchases: [],
    purchaseTypes: [],
    years: [],
    isLoading: false,
}

export const purchasesReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case GET_PURCHASES_REQUEST: {
            return {
                ...state,
                isLoading: true,
            }
        }
        case ON_PURCHASES_RESPONSE: {
            return {
                ...state,
                purchases: action.purchases,
                isLoading: false,
            }
        }
        case ON_CREATE_PURCHASE_RESPONSE: {
            return {
                ...state,
                purchases: [
                    ...state.purchases,
                    action.createdPurchase,
                ],
            }
        }
        case ON_UPDATE_PURCHASE_RESPONSE: {
            return {
                ...state,
                purchases: state.purchases.map((purchase) => {
                    return purchase.id === action.updatedPurchase?.id ? {
                        ...action.updatedPurchase,
                    } : purchase
                }),
            }
        }
        case ON_DELETE_PURCHASE_RESPONSE: {
            return {
                ...state,
                purchases: state.purchases.filter((purchase) => purchase.id !== action.purchaseId),
            }
        }
        case ON_PURCHASE_TYPES_RESPONSE: {
            return {
                ...state,
                purchaseTypes: action.purchaseTypes,
            }
        }
        case ON_PURCHASES_YEARS_RESPONSE: {
            return {
                ...state,
                years: action.years,
            }
        }
        default:
            return {...state}
    }
}