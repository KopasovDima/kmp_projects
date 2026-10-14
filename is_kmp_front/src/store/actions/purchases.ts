import {
    CREATE_PURCHASE_REQUEST,
    DELETE_PURCHASE_REQUEST,
    GET_PURCHASE_TYPES_REQUEST,
    GET_PURCHASES_REQUEST,
    GET_PURCHASES_YEARS_REQUEST,
    ON_CREATE_PURCHASE_RESPONSE,
    ON_DELETE_PURCHASE_RESPONSE,
    ON_PURCHASE_TYPES_RESPONSE,
    ON_PURCHASES_RESPONSE,
    ON_PURCHASES_YEARS_RESPONSE,
    ON_UPDATE_PURCHASE_RESPONSE,
    UPDATE_PURCHASE_REQUEST,
} from '@/store/actionTypes'

export const getPurchasesAction = (year?: number) => ({
    type: GET_PURCHASES_REQUEST,
    year,
})

export const onPurchasesResponseAction = (purchases: any[]) => ({
    type: ON_PURCHASES_RESPONSE,
    purchases,
})

export const createPurchaseAction = (
    name: string,
    volume: number,
    cost: number,
    typeId: number,
    startDate: string,
    endDate: string,
    initiator?: string,
    initiatorDepartment?: string,
    purchaseNumber?: string,
    protocolDate?: string,
    protocolNumber?: string,
    protocolDateFinal?: string,
    protocolNumberFinal?: string,
    purchaseMethod?: string,
    volumeUnit?: string,
    requestsNumber?: number,
    confirmedRequestsNumber?: number,
    supplierName?: string,
    supplierINN?: string,
    supplierCost?: number,
    productType?: string,
    supplierType?: string,
    agreementNumber?: string,
    agreementDate?: string,
    registerMonth?: string,
    registerNumber?: string,
    comment?: string,
) => ({
    type: CREATE_PURCHASE_REQUEST,
    name,
    volume,
    cost,
    typeId,
    startDate,
    endDate,
    initiator,
    initiatorDepartment,
    purchaseNumber,
    protocolDate,
    protocolNumber,
    protocolDateFinal,
    protocolNumberFinal,
    purchaseMethod,
    volumeUnit,
    requestsNumber,
    confirmedRequestsNumber,
    supplierName,
    supplierINN,
    supplierCost,
    productType,
    supplierType,
    agreementNumber,
    agreementDate,
    registerMonth,
    registerNumber,
    comment,
})

export const onCreatePurchaseResponseAction = (createdPurchase: any) => ({
    type: ON_CREATE_PURCHASE_RESPONSE,
    createdPurchase,
})

export const updatePurchaseAction = (
    purchaseId: number,
    name: string,
    volume: number,
    cost: number,
    typeId: number,
    startDate: string,
    endDate: string,
    initiator?: string,
    initiatorDepartment?: string,
    purchaseNumber?: string,
    protocolDate?: string,
    protocolNumber?: string,
    protocolDateFinal?: string,
    protocolNumberFinal?: string,
    purchaseMethod?: string,
    volumeUnit?: string,
    requestsNumber?: number,
    confirmedRequestsNumber?: number,
    supplierName?: string,
    supplierINN?: string,
    supplierCost?: number,
    productType?: string,
    supplierType?: string,
    agreementNumber?: string,
    agreementDate?: string,
    registerMonth?: string,
    registerNumber?: string,
    comment?: string,
) => ({
    type: UPDATE_PURCHASE_REQUEST,
    purchaseId,
    name,
    volume,
    cost,
    typeId,
    startDate,
    endDate,
    initiator,
    initiatorDepartment,
    purchaseNumber,
    protocolDate,
    protocolNumber,
    protocolDateFinal,
    protocolNumberFinal,
    purchaseMethod,
    volumeUnit,
    requestsNumber,
    confirmedRequestsNumber,
    supplierName,
    supplierINN,
    supplierCost,
    productType,
    supplierType,
    agreementNumber,
    agreementDate,
    registerMonth,
    registerNumber,
    comment,
})

export const onUpdatePurchaseResponseAction = (updatedPurchase: any) => ({
    type: ON_UPDATE_PURCHASE_RESPONSE,
    updatedPurchase,
})

export const deletePurchaseAction = (purchaseId: number) => ({
    type: DELETE_PURCHASE_REQUEST,
    purchaseId,
})

export const onDeletePurchaseResponseAction = (purchaseId: number) => ({
    type: ON_DELETE_PURCHASE_RESPONSE,
    purchaseId,
})

export const getPurchaseTypesAction = () => ({
    type: GET_PURCHASE_TYPES_REQUEST,
})

export const onPurchaseTypesResponseAction = (purchaseTypes: any[]) => ({
    type: ON_PURCHASE_TYPES_RESPONSE,
    purchaseTypes,
})

export const getPurchasesYearsAction = () => ({
    type: GET_PURCHASES_YEARS_REQUEST,
})

export const onPurchasesYearsResponseAction = (years: any[]) => ({
    type: ON_PURCHASES_YEARS_RESPONSE,
    years,
})
