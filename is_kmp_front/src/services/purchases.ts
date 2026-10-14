import {sendIsKmpRequest} from '@/services'

export const getPurchasesRequest = async (year?: number) => {
    return await sendIsKmpRequest(
        `purchases/${year ? ('?year='  + year) : ''}`,
        'GET',
        null,
        {UseChildCompanyId: true},
    )
}

export const createPurchaseRequest = async (
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
) => {
    return await sendIsKmpRequest(
        'purchases/create/',
        'POST',
        {
            name,
            volume,
            cost,
            purchase_type_id: typeId,
            start_date: startDate,
            end_date: endDate,
                ...(initiator ? {initiator} : {}),
                ...(initiatorDepartment ? {initiator_department: initiatorDepartment} : {}),
                ...(purchaseNumber ? {purchase_number: purchaseNumber} : {}),
                ...(protocolDate ? {protocol_date: protocolDate} : {}),
                ...(protocolNumber ? {protocol_number: protocolNumber} : {}),
                ...(protocolDateFinal ? {protocol_date_final: protocolDateFinal} : {}),
                ...(protocolNumberFinal ? {protocol_number_final: protocolNumberFinal} : {}),
                ...(purchaseMethod ? {purchase_method: purchaseMethod} : {}),
                ...(volumeUnit ? {volume_unit: volumeUnit} : {}),
                ...(requestsNumber !== null ? {requests_number: requestsNumber} : {}),
                ...(confirmedRequestsNumber !== null ? {confirmed_requests_number: confirmedRequestsNumber} : {}),
                ...(supplierName ? {supplier_name: supplierName} : {}),
                ...(supplierINN ? {supplier_inn: supplierINN} : {}),
                ...(supplierCost ? {supplier_cost: supplierCost} : {}),
                ...(productType ? {product_type: productType} : {}),
                ...(supplierType ? {supplier_type: supplierType} : {}),
                ...(agreementNumber ? {agreement_number: agreementNumber} : {}),
                ...(agreementDate ? {agreement_date: agreementDate} : {}),
                ...(registerMonth ? {register_month: registerMonth} : {}),
                ...(registerNumber ? {register_number: registerNumber} : {}),
                ...(comment ? {comment} : {}),
        },
        {UseChildCompanyId: true},
    )
}

export const updatePurchaseRequest = async (
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
) => {
    return await sendIsKmpRequest(
        `purchases/${purchaseId}/update/`,
        'PUT',
        {
            name,
            volume,
            cost,
            purchase_type_id: typeId,
            start_date: startDate,
            end_date: endDate,
                ...(initiator ? {initiator} : {}),
                ...(initiatorDepartment ? {initiator_department: initiatorDepartment} : {}),
                ...(purchaseNumber ? {purchase_number: purchaseNumber} : {}),
                ...(protocolDate ? {protocol_date: protocolDate} : {}),
                ...(protocolNumber ? {protocol_number: protocolNumber} : {}),
                ...(protocolDateFinal ? {protocol_date_final: protocolDateFinal} : {}),
                ...(protocolNumberFinal ? {protocol_number_final: protocolNumberFinal} : {}),
                ...(purchaseMethod ? {purchase_method: purchaseMethod} : {}),
                ...(volumeUnit ? {volume_unit: volumeUnit} : {}),
                ...(requestsNumber !== null ? {requests_number: requestsNumber} : {}),
                ...(confirmedRequestsNumber !== null ? {confirmed_requests_number: confirmedRequestsNumber} : {}),
                ...(supplierName ? {supplier_name: supplierName} : {}),
                ...(supplierINN ? {supplier_inn: supplierINN} : {}),
                ...(supplierCost ? {supplier_cost: supplierCost} : {}),
                ...(productType ? {product_type: productType} : {}),
                ...(supplierType ? {supplier_type: supplierType} : {}),
                ...(agreementNumber ? {agreement_number: agreementNumber} : {}),
                ...(agreementDate ? {agreement_date: agreementDate} : {}),
                ...(registerMonth ? {register_month: registerMonth} : {}),
                ...(registerNumber ? {register_number: registerNumber} : {}),
                ...(comment ? {comment} : {}),
        },
        {UseChildCompanyId: true},
    )
}

export const deletePurchaseRequest = async (purchaseId: number) => {
    return await sendIsKmpRequest(`purchases/${purchaseId}/delete/`, 'DELETE')
}

export const getPurchaseTypesRequest = async () => {
    return await sendIsKmpRequest('purchases/types/', 'GET')
}

export const getPurchasesYearsRequest = async () => {
    return await sendIsKmpRequest(
        'purchases/years/',
        'GET',
        null,
        {UseChildCompanyId: true},
    )
}
